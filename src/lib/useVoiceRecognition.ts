"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type VoiceState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "error";

interface Options {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
}

export function useVoiceRecognition({ language = "en-ZA", onResult }: Options = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSpeechRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setIsSupported(false);
  }, []);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    rafRef.current = null;
    timerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    setElapsed(0);
    hasSpeechRef.current = false;
    setState("requesting_permission");

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.");
      setState("error");
      return;
    }

    // Request audio for real waveform
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        setAudioLevel(Math.min(100, (sum / dataArray.length) * 2.5));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e: any) {
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("Microphone access was denied. Please allow microphone access in your browser settings, or type the transaction instead.");
      } else if (e.name === "NotFoundError") {
        setError("No microphone found. You can type the transaction instead.");
      } else {
        setError("Could not access the microphone. You can still type the transaction.");
      }
      setState("error");
      cleanupAudio();
      return;
    }

    // Setup speech recognition
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setState("listening");
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 250);
    };

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      const combined = (finalText || interimText).trim();
      if (combined) {
        hasSpeechRef.current = true;
        setTranscript(combined);
        onResult?.(combined, !!finalText);
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore "no-speech" if we already got text
      if (event.error === "no-speech" && hasSpeechRef.current) return;
      const msg =
        event.error === "no-speech"
          ? "I didn't hear anything. Try speaking again, or type the transaction below."
          : event.error === "not-allowed"
          ? "Microphone access was denied."
          : event.error === "aborted"
          ? null // user cancelled, not an error
          : `Speech recognition error: ${event.error}`;
      if (msg) {
        setError(msg);
        setState("error");
      }
      cleanupAudio();
    };

    recognition.onend = () => {
      cleanupAudio();
      setState((prev) => (prev === "error" ? "error" : "processing"));
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start speech recognition. Try again or type the transaction.");
      setState("error");
      cleanupAudio();
    }
  }, [language, onResult, cleanupAudio]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    cleanupAudio();
  }, [cleanupAudio]);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setError(null);
    setElapsed(0);
    setState("idle");
  }, [stop]);

  const retry = useCallback(() => {
    setError(null);
    setTranscript("");
    setElapsed(0);
    setState("idle");
  }, []);

  return {
    state,
    transcript,
    error,
    isSupported,
    audioLevel,
    elapsed,
    start,
    stop,
    reset,
    retry,
  };
}