"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white dark:bg-[#1A1F52] border-2 border-[#5B5BE0] rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300 print:hidden">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#5B5BE0]/10 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>
        <div>
          <p className="font-extrabold text-[#14173F] dark:text-white text-sm">Install SCRIBE</p>
          <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] leading-relaxed mt-0.5">
            Add SCRIBE to your home screen for instant access — works offline.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-1 py-2 text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] hover:text-[#14173F] dark:hover:text-white transition-colors"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 bg-[#5B5BE0] text-white text-xs font-bold rounded-lg hover:bg-[#4B4FC9] transition-colors shadow-sm"
        >
          Install
        </button>
      </div>
    </div>
  );
}