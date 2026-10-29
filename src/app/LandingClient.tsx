"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Banknote, FileText, ShieldAlert, Layers,
  BookOpen, Lock, Eye, Clock, AlertTriangle, Sparkles, Shield, Check, X,
  ChevronDown, Bot,
} from "lucide-react";

/* ─── Tokens ─────────────────────────────────────────────────── */
const NAVY = "#14173F";
const INDIGO = "#5B5BE0";
const DEEP = "#4B4FC9";
const SLATE = "#4A4F7A";

type VerdictKey = "SEALED" | "WARN" | "BROKEN";
const VERDICT: Record<VerdictKey, { c: string; tint: string; blob: string; label: string; sub: string }> = {
  SEALED: { c: "#47745D", tint: "#E3F0E8", blob: "#7CB09A", label: "SEALED", sub: "Hash chain intact" },
  WARN:   { c: "#D99A00", tint: "#FFF4DC", blob: "#F2B84B", label: "WARN",   sub: "Variance open" },
  BROKEN: { c: "#A94E40", tint: "#F6E3DD", blob: "#E8806C", label: "BROKEN", sub: "Chain is broken" },
};

type ThemeKey = "light" | "warm" | "mint" | "dark";
const THEMES: Record<ThemeKey, { bg: string; a: string; b: string; dot: string }> = {
  light: { bg: "#E9EBFF", a: "#D5D9FF", b: INDIGO,    dot: "rgba(20,23,63,.08)" },
  warm:  { bg: "#FBF1D9", a: "#FCE7B4", b: "#D99A00", dot: "rgba(120,80,0,.09)" },
  mint:  { bg: "#E4F0E8", a: "#C7E0D3", b: "#47745D", dot: "rgba(30,90,60,.10)" },
  dark:  { bg: NAVY,       a: "#232A5C", b: "#A9AEFF", dot: "rgba(255,255,255,.06)" },
};

/* ─── Content ────────────────────────────────────────────────── */
interface Scenario {
  id: string;
  tab: string;
  verdict: VerdictKey;
  chat: string;
  fields: [string, string, string, boolean][];
  reasons: string[];
  say: string;
}
const SCENARIOS: Scenario[] = [
  {
    id: "sale", tab: "Recorded sale", verdict: "SEALED",
    chat: '"Sold 3 Albany bread for R45 to a walk-in."',
    fields: [
      ["Amount", "R45.00", "R45.00", true],
      ["Item", "Albany Bread", "Albany Bread", true],
      ["Hash", "a8f9c2…", "a8f9c2…", true],
      ["Signature", "Ed25519", "Valid", true],
    ],
    reasons: ["Record, receipt photo and stock movement all agree."],
    say: "This sale is sealed. Include it in a lender statement with confidence.",
  },
  {
    id: "tamper", tab: "Edited record", verdict: "BROKEN",
    chat: '"The total was changed after it was saved."',
    fields: [
      ["Amount", "R45.00", "R54.00", false],
      ["Item", "Albany Bread", "Albany Bread", true],
      ["Hash", "a8f9c2…", "f3d4e1…", false],
      ["Signature", "Ed25519", "Mismatch", false],
    ],
    reasons: ["The stored hash no longer matches the record's contents.", "Every later record is flagged as suspect until restored."],
    say: "This record was edited after it was sealed. Restore from backup, or document why the change happened.",
  },
  {
    id: "variance", tab: "Stock variance", verdict: "WARN",
    chat: '"Physical count is 30, but expected is 38."',
    fields: [
      ["Expected", "38 units", "38 units", true],
      ["Counted", "38 units", "30 units", false],
      ["Variance", "0", "-8", false],
      ["Hash", "9c2f1a…", "9c2f1a…", true],
    ],
    reasons: ["Eight units are missing.", "The variance stays open until you explain it or write it off."],
    say: "Eight units unaccounted for. Ask me about it, or open an investigation case.",
  },
  {
    id: "lender", tab: "Lender ready", verdict: "SEALED",
    chat: '"Can I get a loan against 6 months of records?"',
    fields: [
      ["Months", "6", "6", true],
      ["Records", "412", "412", true],
      ["Integrity", "100%", "100%", true],
      ["Signature", "Ed25519", "Valid", true],
    ],
    reasons: ["Every record is sealed and signature-valid.", "Readiness score: 78–84."],
    say: "Your ledger is ready for a lender statement. Export the PDF from the Reports tab.",
  },
];

const MOMENTS = [
  {
    icon: Banknote, title: "Cash leaves no trail",
    scam: "Sales recorded on a scrap of paper, in a WhatsApp thread, or only in your memory. When the month ends, half the money has no story.",
    help: "SCRIBE gives every transaction a home. Voice, photo, CSV or manual entry — the record is sealed the moment you tap save.",
  },
  {
    icon: Layers, title: "Stock doesn't add up",
    scam: "You ordered 200 units, sold 150, and your shelf shows 42. Deterministic math tells you something is off, but not why.",
    help: "SCRIBE reconciles stock against sales and receipts every day. Variances are surfaced, not buried.",
  },
  {
    icon: FileText, title: "A lender asks for proof",
    scam: "You have six months of hustle but no six months of records. The bank wants statements you cannot produce.",
    help: "SCRIBE turns daily captures into an evidence-backed lender statement with a public QR code the bank can verify.",
  },
  {
    icon: ShieldAlert, title: "Someone edits the books",
    scam: "A number changes. A description shifts. Without a traceable chain, nobody can prove it happened.",
    help: "SCRIBE's hash chain makes every edit detectable. Restore from backup, or document why the change happened.",
  },
];

const STEPS: [string, string][] = [
  ["Capture",   "Voice, photo, or manual entry — in the language you speak."],
  ["Structure", "Extracted into a strict schema. Numbers, dates, evidence tier."],
  ["Reconcile", "Deterministic math checks stock against sales and receipts."],
  ["Explain",   "Themba grounds insights in your actual numbers, not averages."],
  ["Verify",    "Hash-chained and Ed25519-signed. Any edit breaks the chain."],
  ["Confirm",   "You see the record, the evidence, and the explanation. Then you approve."],
];

const CHAT: { from: "you" | "t"; t: string; draft?: boolean }[] = [
  { from: "you", t: "Why did my profit drop last week?" },
  { from: "t",   t: "Your recorded sales were flat at R18,420 — within 1% of the previous week. But your expenses rose by R2,410." },
  { from: "t",   t: "R1,900 was a restock of cooking oil on Tuesday. R310 was fuel. So your profit fell because of one supply run, not a sales problem." },
  { from: "you", t: "Was that restock necessary?" },
  { from: "t",   t: "You were down to 12 units, below the reorder threshold of 20. It was necessary. But next time, spread the restock over two invoices to smooth cash flow.", draft: true },
];

const STATS: [number, string, string][] = [
  [3,   "",  "evidence tiers, stated clearly"],
  [6,   "",  "steps from capture to sealed"],
  [100, "%", "of records hash-chained and signed"],
  [0,   "",  "silent edits ever undetected"],
];

const TRUST: [typeof Lock, string, string][] = [
  [Lock,        "Rules decide, Themba explains",  "AI can raise a warning. It can never turn a warning into an approval."],
  [Shield,      "Tamper-evident by design",       "Every record is hash-chained and Ed25519-signed. Any change breaks the chain."],
  [Eye,         "Evidence tiers, stated honestly","A signature proves a record wasn't altered, not that the sale happened."],
  [Clock,       "Short retention",                "Attach only what you need. Delete records when you are done with them."],
  [Sparkles,    "No unverified claims",           "Themba never says a loan was approved or a payment arrived. The bank has the final word."],
  [BookOpen,    "Honest about the prototype",     "This build uses synthetic data only. Legal and privacy positions are provisional."],
];

const FAQ: [string, string][] = [
  ["Is SCRIBE a bookkeeping app?", "No. Bookkeeping captures what happened. SCRIBE captures what happened and makes it provable. Every record is hash-chained and signed, so you can hand the ledger to a lender, an accountant, or a court without rebuilding your story."],
  ["Can I edit a record after I've saved it?", "You can — but SCRIBE will show the edit. The stored hash no longer matches the record's contents, and the chain breaks from that point. That is intentional: correct mistakes, but let the ledger remember that you did."],
  ["Does it connect to my bank?", "No. SCRIBE never asks for a bank login. You send what you already have — voice, photo, CSV, or manual entry — and SCRIBE records it. If a bank feed arrives later, it comes through a partner integration, not a password."],
  ["What does Themba actually do?", "Themba is an explanation layer, not a decision maker. Every number is computed by code, and Themba explains the number in plain language. If Themba is unavailable, plain templates take over."],
  ["Is my data safe?", "Every record is sealed the moment it is saved. Evidence is stored with the record. Nothing is shared without your explicit action. This build uses synthetic data only — legal and privacy positions are provisional."],
  ["Why is it free for small businesses?", "The people who benefit most from provable records are lenders, suppliers, and payment providers. They can sponsor protection for their merchants. We still need to validate this with a pilot."],
];

const TEAM = [
  { initials: "AV", name: "Ayolela Vena", role: "Founding Member · Technology, Intelligence & Quantitative Research",
    desc: "Establishes SCRIBE's original vision and technical foundation — systems architecture, AI integration, data science, and product development." },
  { initials: "LK", name: "Lindokuhle Klaas", role: "Founding Team · People, Administration & Organisational Development",
    desc: "Brings an organisational perspective — administration, people management, governance and structure — aligned with studies in administration and human resources." },
  { initials: "LR", name: "Leopa Ross", role: "Founding Team · Finance, Commercial Strategy & Capital",
    desc: "Contributes a financial and commercial perspective — financial strategy, capital allocation, and commercial development — aligned with studies in finance." },
];

const ROTATING = [
  "a sale happens in cash",
  "stock doesn't reconcile",
  "a lender asks for proof",
  "someone edits the books",
];

/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
@keyframes sk-drift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(70px,-40px) scale(1.12)}66%{transform:translate(-50px,35px) scale(.94)}}
@keyframes sk-drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-80px,60px) scale(1.1)}}
@keyframes sk-drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,-70px) scale(1.15)}}
@keyframes sk-hue{0%,100%{filter:hue-rotate(-24deg)}50%{filter:hue-rotate(28deg)}}
@keyframes sk-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes sk-pop{0%{opacity:0;transform:translateY(10px) scale(.97)}100%{opacity:1;transform:none}}
@keyframes sk-scan{0%{top:-4%}100%{top:104%}}
@keyframes sk-ring{0%{box-shadow:0 0 0 0 rgba(91,91,224,.5)}100%{box-shadow:0 0 0 14px rgba(91,91,224,0)}}
@keyframes sk-float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-16px) rotate(calc(var(--r,0deg) + 4deg))}}
@keyframes sk-dots{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes sk-shine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.sk-drift1{animation:sk-drift1 26s ease-in-out infinite}
.sk-drift2{animation:sk-drift2 32s ease-in-out infinite}
.sk-drift3{animation:sk-drift3 38s ease-in-out infinite}
.sk-hue{animation:sk-hue 22s ease-in-out infinite}
.sk-marquee{animation:sk-marquee 38s linear infinite}
.sk-pop{animation:sk-pop .45s cubic-bezier(.2,.8,.2,1) both}
.sk-scan{animation:sk-scan 1.8s linear infinite}
.sk-ring{animation:sk-ring 1.6s ease-out infinite}
.sk-float{animation:sk-float 9s ease-in-out infinite}
.sk-dot{animation:sk-dots 1.1s infinite}
.sk-shine{background-image:linear-gradient(90deg,currentColor 0%,${INDIGO} 45%,currentColor 90%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sk-shine 7s linear infinite}
.sk-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.sk-reveal.in{opacity:1;transform:none}
.sk-root a:focus-visible,.sk-root button:focus-visible{outline:2px solid ${DEEP};outline-offset:3px;border-radius:8px}
@media (prefers-reduced-motion:reduce){
  .sk-root *{animation:none!important;transition:none!important}
  .sk-reveal{opacity:1;transform:none}
}
`;

/* ─── Helpers ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`sk-reveal ${shown ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 1400, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

function Tilt({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-200 will-change-transform ${className}`}>
      {children}
    </div>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── Dynamic background ─────────────────────────────────────── */
function Backdrop({ t }: { t: { bg: string; a: string; b: string; dot: string } }) {
  const tr = "background-color 1.4s ease";
  const mask = "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)";
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: t.bg, transition: tr }}>
      <div className="absolute inset-0 sk-hue">
        <div className="absolute -top-44 left-1/2 w-[820px] h-[820px] -ml-[410px] rounded-full blur-[120px] sk-drift1"
          style={{ backgroundColor: t.a, opacity: 0.7, transition: tr }} />
        <div className="absolute top-[8%] -right-40 w-[560px] h-[560px] rounded-full blur-[140px] sk-drift2"
          style={{ backgroundColor: t.b, opacity: 0.22, transition: tr }} />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full blur-[130px] sk-drift3"
          style={{ backgroundColor: t.b, opacity: 0.16, transition: tr }} />
      </div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(${t.dot} 1px, transparent 1px)`, backgroundSize: "28px 28px",
        maskImage: mask, WebkitMaskImage: mask,
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(480px circle at var(--mx,50%) var(--my,30%), rgba(91,91,224,.14), transparent 62%)",
      }} />
    </div>
  );
}

/* ─── Verdict card + live check ──────────────────────────────── */
function VerdictCard({ s }: { s: Scenario }) {
  const v = VERDICT[s.verdict];
  return (
    <div className="sk-pop rounded-2xl bg-white border overflow-hidden shadow-xl" style={{ borderColor: `${v.c}55` }}>
      <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: v.c }}>
        <span className="font-black tracking-wide text-lg">{v.label}</span>
        <span className="text-xs font-semibold opacity-90">{v.sub}</span>
      </div>
      <div className="p-5 space-y-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={{ color: SLATE }}>
              <th className="font-semibold pb-1">Check</th>
              <th className="font-semibold pb-1">Expected</th>
              <th className="font-semibold pb-1">Found</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {s.fields.map(([k, exp, got, ok]) => (
              <tr key={k} className="border-t border-black/5">
                <td className="py-1.5 font-semibold">{k}</td>
                <td className="py-1.5">{exp}</td>
                <td className="py-1.5 font-semibold" style={{ color: ok ? NAVY : VERDICT.BROKEN.c }}>{got}</td>
                <td className="py-1.5 text-right">{ok ? <Check size={16} color={VERDICT.SEALED.c} /> : <X size={16} color={VERDICT.BROKEN.c} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="text-sm space-y-1 list-disc pl-5" style={{ color: NAVY }}>
          {s.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <div className="flex gap-3 rounded-xl p-3" style={{ backgroundColor: `${v.c}12` }}>
          <Bot size={18} className="shrink-0 mt-0.5" color={v.c} />
          <p className="text-sm leading-snug"><span className="font-bold">Themba: </span>{s.say}</p>
        </div>
        <p className="text-xs" style={{ color: SLATE }}>Only your bank can confirm a payment. Themba will never claim otherwise.</p>
      </div>
    </div>
  );
}

const STEP_LABELS = ["Evidence received", "Reading the text", "Checking the chain", "Verifying signature"];

function LiveCheck({ onVerdict }: { onVerdict: (v: VerdictKey) => void }) {
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const hover = useRef(false);
  const s = SCENARIOS[i];

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => { if (!hover.current) setStep((p) => p + 1); }, 950);
    return () => clearInterval(id);
  }, [auto]);

  useEffect(() => {
    if (step === 4) onVerdict(s.verdict);
    if (step >= 11 && auto) { setStep(0); setI((p) => (p + 1) % SCENARIOS.length); }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (idx: number) => { setAuto(false); setI(idx); setStep(4); onVerdict(SCENARIOS[idx].verdict); };

  return (
    <div
      onMouseEnter={() => { hover.current = true; }}
      onMouseLeave={() => { hover.current = false; }}
      className="rounded-3xl bg-white/80 backdrop-blur border border-black/10 shadow-2xl p-4 md:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="sk-ring absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: DEEP }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: DEEP }} />
        </span>
        <span className="text-sm font-bold">Live check</span>
        <span className="ml-auto text-xs" style={{ color: SLATE }}>Synthetic example</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Example scenarios">
        {SCENARIOS.map((sc, idx) => (
          <button key={sc.id} type="button" onClick={() => pick(idx)} aria-pressed={idx === i}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={idx === i
              ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
              : { borderColor: "rgba(20,23,63,.15)", color: NAVY }}>
            {sc.tab}
          </button>
        ))}
      </div>
      <div className="min-h-[27rem]">
        {step < 4 ? (
          <div className="space-y-4">
            <div className="relative h-44 rounded-2xl bg-[#F1F2FF] border border-black/5 overflow-hidden p-4">
              <p className="text-xs mb-3" style={{ color: SLATE }}>
                Buyer says: <span className="font-semibold" style={{ color: NAVY }}>{s.chat}</span>
              </p>
              {[70, 92, 55, 80, 40].map((w, k) => (
                <div key={k} className="h-2 rounded bg-black/10 mb-2.5" style={{ width: `${w}%` }} />
              ))}
              <div className="sk-scan absolute left-0 right-0 h-10" style={{ background: `linear-gradient(to bottom, transparent, ${INDIGO}66, transparent)` }} />
            </div>
            <ul className="space-y-2">
              {STEP_LABELS.map((l, idx) => (
                <li key={l} className="flex items-center gap-3 text-sm transition-opacity duration-300" style={{ opacity: idx <= step ? 1 : 0.35 }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: idx < step ? DEEP : "rgba(20,23,63,.25)" }}>
                    {idx < step ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ) : <VerdictCard key={s.id} s={s} />}
      </div>
    </div>
  );
}

/* ─── Themba chat ────────────────────────────────────────────── */
function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || n >= CHAT.length) { setTyping(false); return; }
    const isT = CHAT[n].from === "t";
    setTyping(isT);
    const id = setTimeout(() => { setTyping(false); setN((p) => p + 1); }, isT ? 1500 : 900);
    return () => clearTimeout(id);
  }, [started, n]);

  return (
    <div ref={ref} className="rounded-3xl bg-white border border-black/10 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3" style={{ backgroundColor: NAVY }}>
        <div className="h-8 w-8 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: INDIGO, color: "#fff" }}>T</div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Themba</p>
          <p className="text-xs text-[#A9AEFF]">Your financial assistant</p>
        </div>
        <button type="button" onClick={() => { setN(0); setStarted(true); }}
          className="ml-auto text-xs font-semibold text-[#A9AEFF] hover:text-white transition-colors">
          Replay
        </button>
      </div>
      <div className="p-4 space-y-3 min-h-[23rem] bg-[#F1F2FF]">
        {CHAT.slice(0, n).map((m, idx) => (
          <div key={idx} className={`sk-pop flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
              m.from === "you" ? "text-white rounded-br-sm" : "bg-white border border-black/5 rounded-bl-sm"
            } ${m.draft ? "italic" : ""}`}
              style={m.from === "you" ? { backgroundColor: INDIGO } : undefined}>
              {m.t}
              {m.draft && (
                <span className="block not-italic text-xs mt-2 font-semibold" style={{ color: SLATE }}>
                  Draft only. You review it before anything is sent.
                </span>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white border border-black/5 px-4 py-3 flex gap-1">
              {[0, 1, 2].map((d) => (
                <span key={d} className="sk-dot h-1.5 w-1.5 rounded-full bg-[#4A4F7A]" style={{ animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingClient({ demoBizId }: { demoBizId: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string>("hero");
  const [heroVerdict, setHeroVerdict] = useState<VerdictKey>("SEALED");
  const [scrolled, setScrolled] = useState(false);
  const [word, setWord] = useState(0);
  const [moment, setMoment] = useState(0);
  const [faq, setFaq] = useState(0);

  const demoHref = demoBizId ? `/demo/${demoBizId}` : "/signup";

  // Cursor spotlight + scroll progress + timeline line
  useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rootRef.current?.style.setProperty("--mx", `${e.clientX}px`);
        rootRef.current?.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setScrolled((prev) => (prev !== h.scrollTop > 24 ? !prev : prev));
      const how = howRef.current;
      if (how && lineRef.current) {
        const r = how.getBoundingClientRect();
        const q = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
        lineRef.current.style.transform = `scaleY(${q})`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Theme follows the section at the middle of the screen
  useEffect(() => {
    const els = document.querySelectorAll("[data-theme]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setTheme(e.target.getAttribute("data-theme") || "light"); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Rotating hero phrase
  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % ROTATING.length), 2600);
    return () => clearInterval(id);
  }, []);

  const hv = VERDICT[heroVerdict];
  const t = theme === "hero"
    ? { bg: hv.tint, a: hv.tint, b: hv.blob, dot: "rgba(20,23,63,.08)" }
    : (THEMES[theme as ThemeKey] || THEMES.light);
  const dark = theme === "dark";
  const M = MOMENTS[moment];
  const MIcon = M.icon;

  return (
    <div ref={rootRef} className="sk-root relative min-h-screen font-sans overflow-x-hidden selection:bg-[#14173F] selection:text-[#A9AEFF]" style={{ color: NAVY }}>
      <style>{CSS}</style>
      <Backdrop t={t} />
      <div ref={barRef} aria-hidden="true" className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left" style={{ backgroundColor: INDIGO, transform: "scaleX(0)" }} />

      {/* Nav */}
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "backdrop-blur-md py-3" : "py-6"}`}
        style={{ backgroundColor: scrolled ? (dark ? "rgba(20,23,63,.8)" : "rgba(233,235,255,.78)") : "transparent", color: dark ? "#E9EBFF" : NAVY }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <button type="button" onClick={() => scrollToId("top")} className="flex items-center gap-3" aria-label="SCRIBE home">
            <div className="w-9 h-9 grid grid-cols-2 gap-0.5 rotate-45 transition-transform duration-700 hover:rotate-[225deg]">
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: dark ? "#fff" : NAVY }} />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: INDIGO }} />
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: INDIGO }} />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: dark ? "#fff" : NAVY }} />
            </div>
            <span className="text-xl font-black tracking-[0.18em]">SCRIBE</span>
          </button>
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            {([["moments", "Where records break"], ["how", "How it works"], ["themba", "Themba"], ["trust", "Trust"], ["team", "Team"], ["faq", "Questions"]] as [string, string][]).map(([id, l]) => (
              <button key={id} type="button" onClick={() => scrollToId(id)} className="opacity-70 hover:opacity-100 transition-opacity">{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-sm font-bold flex items-center gap-2 group">
            Sign in <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      <div className="relative z-10">
        {/* 1. HERO */}
        <header id="top" data-theme="hero" className="relative">
          <div aria-hidden="true" className="absolute top-40 left-[46%] h-14 w-14 rounded-2xl border-2 sk-float hidden md:block"
            style={{ borderColor: `${hv.c}66`, ["--r" as string]: "12deg", transition: "border-color 1s" }} />
          <div aria-hidden="true" className="absolute bottom-24 left-[6%] h-8 w-8 rounded-full sk-float"
            style={{ backgroundColor: `${hv.c}33`, animationDelay: "-3s", transition: "background-color 1s" }} />

          <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-36 md:pt-44 pb-24 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#A9AEFF] mb-8" style={{ backgroundColor: NAVY }}>
                Financial intelligence for the informal economy
              </span>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.98] mb-6">
                Your business,<br />
                <span className="sk-shine">understood.</span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold mb-6 h-16 md:h-9" style={{ color: DEEP }}>
                Making every record provable when{" "}
                <span key={word} className="sk-pop inline-block sk-shine">{ROTATING[word]}</span>
              </p>
              <p className="text-lg text-[#4A4F7A] max-w-xl leading-relaxed mb-10 font-medium">
                SCRIBE turns fragmented records into financial intelligence — what the evidence supports, what doesn&apos;t reconcile, and what to do next. Hash-chained, signed, and explained in plain language.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup"
                  className="font-bold py-4 px-8 rounded-xl text-lg text-[#E9EBFF] flex items-center justify-center gap-3 group hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
                  style={{ backgroundColor: NAVY }}>
                  Start building records
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href={demoHref}
                  className="bg-white font-bold py-4 px-8 rounded-xl text-lg text-[#14173F] border-2 border-white/40 hover:border-[#5B5BE0] hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2">
                  Explore the demo
                </Link>
              </div>
              {demoBizId && (
                <p className="mt-6 text-sm font-medium" style={{ color: SLATE }}>
                  Judge?{" "}
                  <Link href={`/demo/${demoBizId}`} className="font-bold underline decoration-2 underline-offset-4" style={{ color: DEEP }}>
                    Skip to the demo dashboard →
                  </Link>
                </p>
              )}
            </div>
            <Tilt max={4}><LiveCheck onVerdict={setHeroVerdict} /></Tilt>
          </div>
        </header>

        {/* Marquee */}
        <div aria-hidden="true" className="border-y border-black/10 bg-white/40 backdrop-blur overflow-hidden py-4">
          <div className="sk-marquee flex w-max gap-10 whitespace-nowrap text-sm font-semibold">
            {[...["Cash sales forgotten", "Stock variances", "Missing receipts", "Edited records", "No lender proof", "Fragmented WhatsApp records", "Duplicate entries", "Broken hash chain", "Cash on hand vs reported"], ...["Cash sales forgotten", "Stock variances", "Missing receipts", "Edited records", "No lender proof", "Fragmented WhatsApp records", "Duplicate entries", "Broken hash chain", "Cash on hand vs reported"]].map((x, idx) => (
              <span key={idx} className="flex items-center gap-10" style={{ color: SLATE }}>
                {x}<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INDIGO }} />
              </span>
            ))}
          </div>
        </div>

        {/* 2. PILLARS */}
        <section data-theme="light" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-14">Records. Evidence. Intelligence.</h2></Reveal>
            <div className="grid md:grid-cols-3 gap-10">
              {([
                [FileText, "Records", "Every transaction captured — voice, photo, CSV or manual. Structured into a strict schema the moment you save."],
                [Shield,   "Evidence", "Hash-chained and Ed25519-signed. A signature proves the record wasn't altered, not that the sale happened. Stated honestly."],
                [Bot,      "Intelligence", "Themba grounds insights in your actual numbers, not industry averages. Code computes. Themba explains."],
              ] as [typeof FileText, string, string][]).map(([Icon, h, d], idx) => (
                <Reveal key={h} delay={idx * 120}>
                  <Tilt className="h-full border-t-2 pt-6" max={5}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#A9AEFF]" style={{ backgroundColor: NAVY }}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{h}</h3>
                    <p className="leading-relaxed" style={{ color: SLATE }}>{d}</p>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. WHERE RECORDS BREAK */}
        <section id="moments" data-theme="warm" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-4">Records break at four predictable moments.</h2></Reveal>
            <Reveal delay={100}><p className="text-lg max-w-2xl mb-12" style={{ color: SLATE }}>Pick one to see how records fall apart — and how SCRIBE puts them back together.</p></Reveal>
            <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-8 items-start">
              <div className="flex flex-col gap-2" role="tablist">
                {MOMENTS.map((m, idx) => {
                  const Icon = m.icon;
                  const on = idx === moment;
                  return (
                    <button key={m.title} type="button" role="tab" aria-selected={on} onClick={() => setMoment(idx)}
                      className="flex items-center gap-4 text-left rounded-2xl px-5 py-4 border transition-all duration-300 hover:translate-x-1"
                      style={on
                        ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                        : { backgroundColor: "rgba(255,255,255,.6)", borderColor: "rgba(20,23,63,.1)" }}>
                      <Icon size={22} color={on ? "#A9AEFF" : DEEP} />
                      <span className="font-bold">{m.title}</span>
                    </button>
                  );
                })}
              </div>
              <div key={moment} className="sk-pop rounded-3xl bg-white/80 backdrop-blur border border-black/10 shadow-xl p-8 md:p-10 grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: VERDICT.BROKEN.c }}>Where it breaks</p>
                  <p className="text-lg leading-relaxed">{M.scam}</p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: DEEP }}>How SCRIBE repairs it</p>
                  <p className="text-lg leading-relaxed">{M.help}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section id="how" data-theme="mint" className="py-24">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">From tap to sealed in six steps.</h2></Reveal>
            <Reveal delay={100}><p className="text-lg mb-14 max-w-2xl" style={{ color: SLATE }}>Everything that decides is a fixed rule you can test. The AI only explains.</p></Reveal>
            <div ref={howRef} className="relative pl-12 md:pl-16">
              <div className="absolute left-[15px] md:left-[23px] top-2 bottom-2 w-0.5 bg-black/10" />
              <div ref={lineRef} className="absolute left-[15px] md:left-[23px] top-2 bottom-2 w-0.5 origin-top" style={{ backgroundColor: DEEP, transform: "scaleY(0)" }} />
              <div className="space-y-10">
                {STEPS.map(([h, d], idx) => (
                  <Reveal key={h} delay={60}>
                    <div className="relative">
                      <span className="absolute -left-12 md:-left-16 top-0 h-8 w-8 md:h-12 md:w-12 rounded-full flex items-center justify-center font-black text-sm md:text-lg text-[#A9AEFF]" style={{ backgroundColor: NAVY }}>
                        {idx + 1}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold mb-1">{h}</h3>
                      <p className="text-lg max-w-xl" style={{ color: SLATE }}>{d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. THEMBA */}
        <section id="themba" data-theme="light" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Themba turns a number into a plan.</h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: SLATE }}>SCRIBE computes the numbers. Themba explains what they mean, in plain language, grounded in your actual records.</p>
              <ul className="space-y-4">
                {[
                  "Explains which records drove the number.",
                  "Drafts replies and summaries — you approve before anything is sent.",
                  "Builds a task list that stays open until you confirm each step.",
                  "Switches to recovery mode if something has gone wrong.",
                  "Never claims a loan was approved or a payment arrived. The bank has the final word.",
                ].map((x) => (
                  <li key={x} className="flex gap-3 text-lg">
                    <Check size={22} className="shrink-0 mt-1" color={DEEP} />{x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}><ChatDemo /></Reveal>
          </div>
        </section>

        {/* 6. STATS */}
        <section data-theme="light" className="pb-8">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 border-y border-black/10">
            {STATS.map(([n, suf, l], idx) => (
              <div key={l} className={`py-10 px-4 md:px-8 ${idx > 0 ? "md:border-l border-black/10" : ""}`}>
                <p className="text-5xl md:text-6xl font-black tracking-tighter" style={{ color: DEEP }}>
                  <CountUp to={n} suffix={suf} />
                </p>
                <p className="mt-2 font-semibold" style={{ color: SLATE }}>{l}</p>
              </div>
            ))}
          </div>
          <p className="max-w-[1400px] mx-auto px-6 md:px-12 pt-3 text-xs" style={{ color: SLATE }}>
            These are design facts about the prototype, not measured results.
          </p>
        </section>

        {/* 7. TRUST */}
        <section id="trust" data-theme="light" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-14">Trust is not assumed. It is checked — and the limits are stated.</h2></Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12">
              {TRUST.map(([Icon, h, d], idx) => (
                <Reveal key={h} delay={(idx % 3) * 100}>
                  <div className="border-t border-black/15 py-7 group">
                    <Icon size={24} color={DEEP} className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <h3 className="text-lg font-bold mb-1">{h}</h3>
                    <p style={{ color: SLATE }}>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 8. TEAM */}
        <section id="team" data-theme="dark" className="py-24 text-[#E9EBFF]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal>
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-14 gap-6">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Different disciplines.<br />One direction.</h2>
                  <p className="text-[#A9AEFF] text-lg max-w-xl">Three founders building provable records for small businesses.</p>
                </div>
                <p className="text-xs font-semibold text-[#A9AEFF] border border-[#A9AEFF]/30 px-4 py-2 rounded-full w-fit">
                  Built by CODE BLOODED
                </p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAM.map((m, idx) => (
                <Reveal key={m.name} delay={idx * 90}>
                  <Tilt max={6}>
                    <div className="bg-[#0E1130] border border-white/5 rounded-2xl p-8 hover:border-[#A9AEFF]/50 transition-colors duration-300 group h-full">
                      <div
                        className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-xl font-black mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#A9AEFF] group-hover:text-[#14173F]"
                        style={{ backgroundColor: NAVY, color: "#A9AEFF" }}>
                        {m.initials}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                      <p className="text-[#A9AEFF] text-sm font-semibold mb-4">{m.role}</p>
                      <p className="text-sm text-[#A9AEFF]/80 leading-relaxed">{m.desc}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" data-theme="light" className="py-24">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight mb-10">Questions we expect.</h2></Reveal>
            <div className="border-t border-black/15">
              {FAQ.map(([q, a], idx) => {
                const open = faq === idx;
                return (
                  <div key={q} className="border-b border-black/15">
                    <button type="button" aria-expanded={open} onClick={() => setFaq(open ? -1 : idx)} className="w-full flex items-center justify-between gap-6 py-5 text-left">
                      <span className="text-lg font-bold">{q}</span>
                      <ChevronDown size={22} className="shrink-0 transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "none" }} />
                    </button>
                    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .35s ease" }}>
                      <div className="overflow-hidden"><p className="pb-5 text-lg leading-relaxed" style={{ color: SLATE }}>{a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. FOOTER */}
        <footer data-theme="dark" className="py-20 text-center" style={{ color: "#E9EBFF" }}>
          <div className="flex justify-center items-center gap-3 mb-5">
            <div className="w-8 h-8 grid grid-cols-2 gap-0.5 rotate-45">
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: "#A9AEFF" }} />
              <div className="rounded-tr-full rounded-br-full bg-white" />
              <div className="rounded-tl-full rounded-bl-full bg-white" />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: "#A9AEFF" }} />
            </div>
            <span className="text-xl font-black tracking-[0.18em]">SCRIBE</span>
          </div>
          <p className="text-[#A9AEFF] mb-8 font-medium">Build records. Prove them.</p>
          <Link href={demoHref}
            className="font-bold py-3 px-8 rounded-xl hover:bg-white transition-colors inline-flex items-center gap-2 shadow-lg"
            style={{ backgroundColor: INDIGO, color: "#fff" }}>
            {demoBizId ? "Explore the demo" : "Start building records"} <ArrowUpRight size={18} />
          </Link>
          <p className="mt-10 text-xs text-[#A9AEFF]/70">
            Prototype build. Synthetic data only. Legal and privacy positions are provisional.
          </p>
        </footer>
      </div>
    </div>
  );
}