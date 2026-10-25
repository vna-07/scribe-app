"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function GlobalThembaDrawer() {
  const { businessId, thembaOpen, setThembaOpen, history, setHistory } = useApp();
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);

  if (!businessId) return null; // Don't show on pages without a business

  const ask = async (q: string) => {
    if (!q.trim() || asking) return;
    setAsking(true);
    setHistory((h) => [...h, { role: "user", text: q }]);
    setInput("");
    
    try {
      const r = await fetch("/api/themba", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          business_id: businessId, 
          question: q,
          history: history.map(h => ({ role: h.role, text: h.text })) 
        }),
      });
      const json = await r.json();
      setHistory((h) => [
        ...h,
        {
          role: "themba",
          text: json.answer ?? "(no answer)",
          refused: json.refused,
          provider: json.provider,
          sources: json.sources,
          suggestions: json.suggestions,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <>
      {/* ─── FLOATING BUTTON (When closed) ─── */}
      {!thembaOpen && (
        <button
          onClick={() => setThembaOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#14173F] dark:bg-[#5B5BE0] text-white dark:text-[#F1F2FF] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 group border-2 border-white/20 print:hidden"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* ─── SLIDING DRAWER (When open) ─── */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[380px] bg-[#14173F] dark:bg-[#0E1130] border-l border-[#2A3070] shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out print:hidden ${
          thembaOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 bg-[#1A1F52] border-b border-[#2A3070] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A9AEFF] text-[#14173F] flex items-center justify-center font-extrabold text-lg">T</div>
            <div>
              <h2 className="font-extrabold text-lg text-[#F1F2FF]">Themba</h2>
              <p className="text-xs text-[#C5C9F5]">Business Intelligence</p>
            </div>
          </div>
          <button onClick={() => setThembaOpen(false)} className="text-[#C5C9F5] hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {history.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-[#C5C9F5]">I'm here to help you understand your records and grow your business. What would you like to look at?</p>
              {["How can I improve my business?", "Why is my stock short?", "What is my revenue range?"].map(q => (
                <button key={q} onClick={() => ask(q)} className="w-full text-left text-sm p-3 rounded-xl bg-[#1A1F52] hover:bg-[#2A3070] transition-colors text-[#F1F2FF] border border-[#2A3070]">
                  "{q}"
                </button>
              ))}
            </div>
          )}

          {history.map((m, i) => (
            <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
              {m.role === "user" ? (
                <div className="inline-block bg-[#2A3070] rounded-2xl rounded-tr-sm px-4 py-2 text-left max-w-[85%] text-[#F1F2FF]">
                  {m.text}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#A9AEFF] flex shrink-0 items-center justify-center text-[10px] font-extrabold text-[#14173F]">T</div>
                  <div className="space-y-2">
                    <div className="text-[#F1F2FF] leading-relaxed text-sm bg-[#1A1F52] border border-[#2A3070] p-3 rounded-xl rounded-tl-sm">
                      {m.text}
                    </div>
                    {m.refused && (
                      <span className="inline-block text-[10px] uppercase tracking-wider text-[#F2B84B] bg-[#F2B84B]/10 px-2 py-0.5 rounded">Declined</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {asking && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#A9AEFF] flex shrink-0 items-center justify-center text-[10px] font-extrabold text-[#14173F]">T</div>
              <div className="text-[#A9AEFF] text-sm italic animate-pulse">Analysing...</div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1A1F52] border-t border-[#2A3070]">
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your business…"
              disabled={asking}
              className="w-full bg-[#0E1130] border border-[#2A3070] focus:border-[#A9AEFF] outline-none rounded-xl pl-4 pr-12 py-3 text-sm text-[#F1F2FF] placeholder-[#5A5F8C] transition-colors"
            />
            <button type="submit" disabled={asking || !input.trim()} className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#A9AEFF] text-[#14173F] rounded-lg hover:bg-white disabled:opacity-50 transition-colors font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}