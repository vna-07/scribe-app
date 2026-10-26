"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { playSuccessChime } from "@/lib/sounds";

export default function GlobalThembaDrawer() {
  const { businessId, thembaOpen, setThembaOpen, history, setHistory, activeTab } = useApp();
  const { locale, t } = useLanguage();
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  if (!businessId) return null;

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
          history: history.slice(-4),
          locale,
          active_tab: activeTab,
        }),
      });
      const json = await r.json();
      setHistory((h) => [...h, {
        role: "themba",
        text: json.answer ?? "(no answer)",
        proposed_action: json.proposed_action,
        provider: json.provider,
      }]);
    } finally {
      setAsking(false);
    }
  };

  const executeAction = async (index: number, action: any) => {
    setApproved(prev => ({ ...prev, [index]: true }));
    playSuccessChime();

    if (action.type === "create_task") {
      try {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "create_goal",
            business_id: businessId,
            title: action.title,
            description: action.description,
            target_value: null
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (error) {
        setApproved(prev => ({ ...prev, [index]: false }));
        alert(t("themba.saveFailed"));
      }
    }
  };

  const suggestions = [
    t("themba.suggestion.supplier"),
    t("themba.suggestion.stock"),
    t("themba.suggestion.score"),
  ];

  return (
    <>
      {!thembaOpen && (
        <button
          aria-label="Open Themba assistant"
          onClick={() => setThembaOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-16 h-16 bg-[#14173F] dark:bg-[#5B5BE0] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 border-2 border-white/20 print:hidden"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}

      <aside className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-[#F5F1E8] dark:bg-[#14173F] border-l border-[#E8E2D5] dark:border-[#2A3070] shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out print:hidden ${thembaOpen ? "translate-x-0" : "translate-x-full"}`}>

        <div className="p-6 bg-white dark:bg-[#1A1F52] border-b border-[#E8E2D5] dark:border-[#2A3070] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5B5BE0] text-white flex items-center justify-center font-extrabold text-lg">T</div>
            <div>
              <h2 className="font-extrabold text-lg text-[#14173F] dark:text-white">{t("themba.title")}</h2>
              <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">{t("themba.subtitle")}</p>
            </div>
          </div>
          <button
            aria-label="Close Themba assistant"
            onClick={() => setThembaOpen(false)}
            className="text-[#5A5F8C] hover:text-[#14173F] dark:text-[#C5C9F5] dark:hover:text-white p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 no-scrollbar">
          {history.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">{t("themba.intro")}</p>
              {suggestions.map(q => (
                <button key={q} onClick={() => ask(q)} className="w-full text-left text-sm p-3 rounded-xl bg-white dark:bg-[#1A1F52] hover:bg-[#E8E2D5] dark:hover:bg-[#2A3070] transition-colors text-[#14173F] dark:text-white border border-[#E8E2D5] dark:border-[#2A3070]">
                  &quot;{q}&quot;
                </button>
              ))}
            </div>
          )}

          {history.map((m, i) => (
            <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
              {m.role === "user" ? (
                <div className="inline-block bg-[#5B5BE0] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-left max-w-[85%] shadow-sm animate-pop">
                  {m.text}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5B5BE0] flex shrink-0 items-center justify-center text-xs font-extrabold text-white">T</div>
                  <div className="space-y-3 w-full">
                    <div className="text-[#14173F] dark:text-[#F5F1E8] leading-relaxed text-sm bg-white dark:bg-[#1A1F52] border border-[#E8E2D5] dark:border-[#2A3070] p-4 rounded-xl rounded-tl-sm shadow-sm animate-pop">
                      {m.text}
                    </div>

                    {m.provider && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5A5F8C] dark:text-[#C5C9F5]">
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${
                          m.provider === "gemini" ? "bg-[#5B5BE0]" :
                          m.provider === "groq" ? "bg-[#D99A00]" :
                          "bg-[#47745D]"
                        }`} />
                        {m.provider === "gemini" ? "Gemini" : m.provider === "groq" ? "Groq" : "Deterministic"}
                      </span>
                    )}

                    {m.proposed_action && (
                      <div className="bg-white dark:bg-[#2A3070] border-2 border-[#5B5BE0] rounded-xl p-4 shadow-md animate-pop">
                        <div className="flex items-center gap-2 mb-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                          <span className="text-xs font-bold text-[#5B5BE0] uppercase tracking-wider">{t("themba.proposedAction")}</span>
                        </div>
                        <p className="font-bold text-sm text-[#14173F] dark:text-white mb-1">{m.proposed_action.title}</p>
                        <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-4 leading-relaxed whitespace-pre-wrap">{m.proposed_action.description}</p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => executeAction(i, m.proposed_action)}
                            disabled={approved[i]}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${approved[i] ? "bg-[#47745D] text-white animate-pop" : "bg-[#5B5BE0] text-white hover:bg-[#4B4FC9]"}`}
                          >
                            {approved[i] ? `✓ ${t("themba.executed")}` : t("themba.approve")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {asking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5B5BE0] flex shrink-0 items-center justify-center text-xs font-extrabold text-white">T</div>
              <div className="bg-white dark:bg-[#1A1F52] border border-[#E8E2D5] dark:border-[#2A3070] px-4 py-3 rounded-xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#5A5F8C] rounded-full dot-1"></span>
                <span className="w-1.5 h-1.5 bg-[#5A5F8C] rounded-full dot-2"></span>
                <span className="w-1.5 h-1.5 bg-[#5A5F8C] rounded-full dot-3"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-[#1A1F52] border-t border-[#E8E2D5] dark:border-[#2A3070]">
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("themba.placeholder")}
              aria-label={t("themba.placeholder")}
              disabled={asking}
              className="w-full bg-[#F5F1E8] dark:bg-[#0E1130] border border-[#E8E2D5] dark:border-[#2A3070] focus:border-[#5B5BE0] outline-none rounded-xl pl-4 pr-12 py-3 text-sm text-[#14173F] dark:text-white placeholder-[#5A5F8C] transition-colors"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={asking || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#5B5BE0] text-white rounded-lg hover:bg-[#4B4FC9] disabled:opacity-50 transition-colors font-bold"
            >
              ↑
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}