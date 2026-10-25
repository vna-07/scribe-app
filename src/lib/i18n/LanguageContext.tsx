"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Locale, getTranslation } from "./dictionary";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "scribe_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "xh" || saved === "zu" || saved === "af") {
        setLocaleState(saved);
      }
    } catch {}
    setMounted(true);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    try { document.documentElement.lang = next; } catch {}
  };

  const t = (path: string) => getTranslation(locale, path);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {mounted ? children : children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}