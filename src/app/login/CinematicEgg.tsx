"use client";

import { useEffect, useRef, useState } from "react";

export type EggMode = "luv" | "mihlali";

// ─── Timeline (seconds on you.mp4's own clock) ───
const OVERLAP = 8;              // mihlali.mp4 is revealed over the final 8s
const DEDICATION_IN = 3;
const DEDICATION_OUT = 9.5;
const LUV_BLACKOUT_LEAD = 2.4;  // @luv fades to black this long before the end

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

export default function CinematicEgg({
  mode,
  onDone,
}: {
  mode: EggMode;
  onDone: () => void;
}) {
  const youRef = useRef<HTMLVideoElement>(null);
  const secondRef = useRef<HTMLVideoElement>(null);

  const [stageOn, setStageOn] = useState(false);     // login -> black -> stage
  const [revealed, setRevealed] = useState(false);   // video reveal from black
  const [dedication, setDedication] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);   // iOS refused sound autoplay
  const needsTapRef = useRef(false);

  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const closing = useRef(false);
  const started = useRef(false);
  const blackoutRef = useRef(false);
  const dedicationRef = useRef(false);
  const secondStarted = useRef(false);
  const secondBroken = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const silence = () => {
    for (const v of [youRef.current, secondRef.current]) {
      if (!v) continue;
      v.pause();
      v.muted = true;
    }
  };

  // Fade the whole stage out, then hand control back to the login screen.
  const leave = (holdMs: number) => {
    if (closing.current) return;
    closing.current = true;
    cancelAnimationFrame(raf.current);
    later(() => {
      setStageOn(false); // 1s CSS fade
      later(() => {
        silence();
        onDoneRef.current();
      }, 1000);
    }, holdMs);
  };

  // Runs inside a real tap, so iOS allows playback with sound.
  const tapToPlay = () => {
    const you = youRef.current;
    if (!you) return;
    you.muted = false;
    you.play()
      .then(() => {
        needsTapRef.current = false;
        setNeedsTap(false);
      })
      .catch(() => leave(0));
  };

  const skip = () => {
    silence(); // stop audio immediately
    leave(0);
  };

  // ─── Per-frame choreography, driven by the video clock ───
  const tick = () => {
    const you = youRef.current;
    const second = secondRef.current;
    if (!you || closing.current) return;

    const dur = you.duration;
    const t = you.currentTime;

    if (Number.isFinite(dur) && dur > 0) {
      const remaining = dur - t;

      // slow push-in on the main footage
      you.style.transform = `scale(${1 + 0.04 * clamp(t / dur)})`;

      // dedication title
      if (mode === "mihlali") {
        const want = t >= DEDICATION_IN && t <= DEDICATION_OUT;
        if (want !== dedicationRef.current) {
          dedicationRef.current = want;
          setDedication(want);
        }
      }

      // @luv: fade to black as the video approaches its end
      if (mode === "luv" && remaining <= LUV_BLACKOUT_LEAD && !blackoutRef.current) {
        blackoutRef.current = true;
        setBlackout(true);
      }

      // @MihlaliLUV: crossfade mihlali.mp4 over the final OVERLAP seconds
      if (mode === "mihlali" && second && !secondBroken.current) {
        const p = clamp(1 - remaining / OVERLAP);
        if (p > 0) {
          if (!secondStarted.current) {
            secondStarted.current = true;
            second.currentTime = 0;
            second.play().catch(() => {
              secondBroken.current = true;
            });
          } else if (!you.ended && !second.ended && you.paused !== second.paused) {
            // keep the silent layer in step if the main video buffers/pauses
            if (you.paused) second.pause();
            else second.play().catch(() => {});
          }
          const e = easeInOutCubic(p);
          second.style.opacity = String(e);
          second.style.transform = `scale(${1.06 - 0.06 * e})`;
        }
      }
    }

    raf.current = requestAnimationFrame(tick);
  };

  const handlePlaying = () => {
    if (started.current) return;
    started.current = true;
    setRevealed(true);
    raf.current = requestAnimationFrame(tick);
  };

  const handleEnded = () => {
    cancelAnimationFrame(raf.current);
    const second = secondRef.current;
    if (mode === "mihlali" && second && !secondBroken.current) {
      second.style.opacity = "1";
      second.style.transform = "scale(1)";
    }
    // @luv is already dark; @MihlaliLUV fades out now (2.2s), then a short pause
    const alreadyDark = blackoutRef.current;
    if (!alreadyDark) {
      blackoutRef.current = true;
      setBlackout(true);
    }
    leave(alreadyDark ? 900 : 2200 + 900);
  };

  // ─── Mount: start playback (we're inside the submit gesture) ───
  useEffect(() => {
    const you = youRef.current;
    const second = secondRef.current;
    if (!you) return;

    you.muted = false;
    you.volume = 1;
    if (second) second.muted = true; // mihlali.mp4 must stay silent

    const frame = requestAnimationFrame(() => setStageOn(true));
    you.play().catch((err) => {
      // iOS may refuse sound-on autoplay: ask for a real tap instead of bailing
      if (err?.name === "NotAllowedError") {
        needsTapRef.current = true;
        setNeedsTap(true);
      } else {
        leave(0);
      }
    });
    later(() => {
      if (!started.current && !needsTapRef.current) leave(0); // never started
    }, 10000);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown", onKey);
      timers.current.forEach((id) => clearTimeout(id));
      timers.current = [];
      silence();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic video"
      className="egg-stage"
      data-on={stageOn}
    >
      <style>{CSS}</style>

      <video
        ref={youRef}
        src="/you.mp4"
        playsInline
        preload="auto"
        onPlaying={handlePlaying}
        onEnded={handleEnded}
        onError={() => leave(0)}
        className={`egg-video egg-you ${revealed ? "is-in" : ""}`}
      />

      {mode === "mihlali" && (
        <video
          ref={secondRef}
          src="/mihlali.mp4"
          muted
          playsInline
          preload="auto"
          onError={() => {
            secondBroken.current = true; // carry on with you.mp4 alone
          }}
          className="egg-video egg-second"
        />
      )}

      <div className="egg-vignette" aria-hidden />

      <div className={`egg-record ${revealed ? "is-in" : ""}`} aria-hidden>
        <div className="egg-tilt">
          <div className="egg-disc">
            <div className="egg-label" />
          </div>
          <div className="egg-sheen" />
        </div>
      </div>

      {mode === "mihlali" && (
        <p className={`egg-dedication ${dedication ? "is-on" : ""}`}>
          Dedicated to Mihlali, my artist.
        </p>
      )}

      <div className={`egg-black ${blackout ? "is-on" : ""}`} aria-hidden />

      {needsTap && (
        <button type="button" onClick={tapToPlay} className="egg-tap">
          Tap to play
        </button>
      )}

      <button type="button" onClick={skip} className="egg-skip">
        Skip
      </button>
    </div>
  );
}

const CSS = `
.egg-stage{position:fixed;inset:0;z-index:9999;background:#000;overflow:hidden;opacity:0;transition:opacity 1s ease}
.egg-stage[data-on="true"]{opacity:1}

.egg-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:opacity,transform}
.egg-you{opacity:0;filter:blur(10px) brightness(.5);transition:opacity 3s ease,filter 3.2s ease}
.egg-you.is-in{opacity:1;filter:none}
.egg-second{opacity:0;transform:scale(1.06)}

.egg-vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.45) 100%)}

/* ── Vinyl record ── */
.egg-record{position:absolute;right:-20vmin;bottom:-4vmin;width:84vmin;height:84vmin;
  pointer-events:none;mix-blend-mode:screen;opacity:0;perspective:1400px}
.egg-record.is-in{animation:egg-record-in 3.5s .6s cubic-bezier(.22,1,.36,1) forwards}
.egg-record::before{content:"";position:absolute;inset:-18%;border-radius:50%;
  background:radial-gradient(circle,rgba(255,160,190,.35),transparent 65%);
  animation:egg-breathe 6s ease-in-out infinite alternate}
.egg-tilt{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(58deg) rotateZ(-24deg)}
.egg-disc{position:absolute;inset:0;border-radius:50%;
  background:
    repeating-radial-gradient(circle at center,rgba(255,255,255,.10) 0 1px,rgba(255,255,255,.015) 1px 3px),
    #15131d;
  box-shadow:0 0 0 1px rgba(255,255,255,.12),0 0 80px rgba(255,170,190,.25),inset 0 0 60px rgba(255,255,255,.06);
  animation:egg-spin 14s linear infinite}
.egg-label{position:absolute;left:33%;top:33%;width:34%;height:34%;border-radius:50%;
  background:
    radial-gradient(circle,#000 0 5%,transparent 5.5%),
    linear-gradient(90deg,transparent 48.5%,rgba(255,255,255,.55) 49% 51%,transparent 51.5%) ,
    radial-gradient(circle at 35% 30%,#f2b8c6,#b45a74 60%,#5a2236)}
.egg-sheen{position:absolute;inset:0;border-radius:50%;
  background:conic-gradient(from 20deg,transparent 0 8%,rgba(255,214,225,.35) 14%,transparent 22% 58%,rgba(190,200,255,.28) 66%,transparent 74%)}

/* ── Dedication ── */
.egg-dedication{position:absolute;left:0;right:0;bottom:16vh;margin:0;padding:0 6vw;text-align:center;pointer-events:none;
  font-family:"Cormorant Garamond","Iowan Old Style","Palatino Linotype",Georgia,serif;
  font-style:italic;font-weight:400;font-size:clamp(1.5rem,4.2vw,2.8rem);color:#fff3f0;
  letter-spacing:.55em;opacity:0;filter:blur(6px);
  text-shadow:0 0 24px rgba(255,170,190,.55),0 2px 30px rgba(0,0,0,.6);
  transition:opacity 2.4s cubic-bezier(.22,1,.36,1),letter-spacing 3.2s cubic-bezier(.22,1,.36,1),filter 2.4s ease}
.egg-dedication.is-on{opacity:1;letter-spacing:.1em;filter:blur(0)}

/* ── Fade to black + skip ── */
.egg-black{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity 2.2s ease-in-out}
.egg-black.is-on{opacity:1}
.egg-tap{position:absolute;inset:0;z-index:3;width:100%;background:transparent;border:0;cursor:pointer;
  color:rgba(255,243,240,.85);font-family:"Cormorant Garamond","Iowan Old Style",Georgia,serif;
  font-style:italic;font-size:clamp(1.3rem,4vw,2rem);letter-spacing:.25em;text-shadow:0 0 24px rgba(255,170,190,.5);
  animation:egg-breathe 2.4s ease-in-out infinite alternate}
.egg-skip{position:absolute;right:2rem;bottom:2rem;z-index:2;background:none;border:0;cursor:pointer;
  color:rgba(255,255,255,.3);font-size:.8rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;transition:color .3s}
.egg-skip:hover,.egg-skip:focus-visible{color:rgba(255,255,255,.85)}

@keyframes egg-spin{to{transform:rotate(360deg)}}
@keyframes egg-breathe{from{opacity:.45;transform:scale(.96)}to{opacity:.9;transform:scale(1.04)}}
@keyframes egg-record-in{from{opacity:0;transform:translateY(6vmin) scale(.94)}to{opacity:.6;transform:none}}

@media (prefers-reduced-motion:reduce){
  .egg-disc{animation-duration:90s}
  .egg-record::before{animation:none}
  .egg-dedication{letter-spacing:.1em;filter:none;transition:opacity 1s linear}
}
`;