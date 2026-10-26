"use client";

import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial state safely (avoids hydration mismatch)
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setWasOffline(true);
      // Hide the "Back Online" message after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !wasOffline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] text-xs font-bold py-2 px-4 text-center shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
        isOffline
          ? "bg-[#D99A00] text-white translate-y-0"
          : "bg-[#47745D] text-white translate-y-0"
      }`}
    >
      {isOffline ? (
        <>
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>You are offline. Working from local cache.</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Back online</span>
        </>
      )}
    </div>
  );
}