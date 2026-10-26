"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition({
  language = "en-ZA",
  continuous = false,
  onResult,
  onError,
}: UseVoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      const combined = finalText || interimText;
      if (combined) {
        setTranscript(combined);
        onResult?.(combined, !!finalText);
      }
    };

    recognition.onerror = (event: any) => {
      const errMsg = event.error === "not-allowed"
        ? "Microphone permission denied. Please allow microphone access in your browser."
        : event.error === "no-speech"
        ? "No speech detected. Try again."
        : `Speech recognition error: ${event.error}`;
      setError(errMsg);
      setIsListening(false);
      onError?.(errMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch {}
    };
  }, [language, continuous, onResult, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      // Already started
      if (e.message?.includes("already started")) {
        setIsListening(true);
      } else {
        setError("Could not start microphone. Check your browser permissions.");
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    start,
    stop,
    reset,
  };
}