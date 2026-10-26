"use client";

import { useState } from "react";

export default function AISummaryCard() {
  const [expanded, setExpanded] = useState(false);

  const highlights = [
    { date: "2021-2026", text: "Over 1,000 verified trading days recorded in the SCRIBE ledger." },
    { date: "2026", text: "Migrated from paper cash-books to cryptographic, tamper-evident records." },
    { date: "2025", text: "Navigated post-pandemic supply chain shifts by diversifying product lines." },
    { date: "2006", text: "Siyanda founded the shop in Gugulethu, growing it into a community staple." },
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#1A1F52] rounded-[24px] border border-[#E1E4F7] dark:border-[#2A3070] shadow-sm mb-6 animate-stagger">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#A9AEFF]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5B5BE0] text-white flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 5.8L20 10l-5.1 2.9L15 19l-3-4.5L9 19l.1-6.1L4 10l6.1-1.2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg leading-tight">
                Business summary
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B89A61] dark:text-[#A9AEFF]">
                AI-generated · Themba
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-[#5A5F8C] dark:text-[#C5C9F5] bg-[#F1F2FF] dark:bg-[#2A3070] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#47745D]"></span>
            Real historical data
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[#14173F] dark:text-[#F1F2FF] leading-relaxed">
            <strong>Siyanda's Spaza</strong> is a 20-year-old community staple located in{" "}
            <strong>Gugulethu & Khayelitsha, Western Cape</strong>. Founded in <strong>2006</strong> by Siyanda Lungiswa, the shop serves everyday essentials — bread, airtime, cold drinks, and FMCG — on a cash-based, walk-in model.
          </p>
          
          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 text-xs text-[#4A4F7A] dark:text-[#C5C9F5] border border-[#E1E4F7] dark:border-[#3A4080]">
            <strong>Data Note:</strong> This workspace is powered by Siyanda's actual transaction history from 2021 to 2026. Personal customer information has been anonymised to protect privacy.
          </div>

          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-bold text-[#5B5BE0] dark:text-[#A9AEFF] hover:underline"
            >
              Show recent highlights and outlook →
            </button>
          )}

          {expanded && (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-2 mt-2">
                  Recent highlights
                </p>
                <ul className="space-y-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-[#B89A61] dark:text-[#A9AEFF] font-bold tabular-nums shrink-0 w-20">{h.date}</span>
                      <span className="text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">{h.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#F8F9FF] dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#2A3070] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B89A61] dark:text-[#A9AEFF] mb-1">
                  Forward-looking insight
                </p>
                <p className="text-sm text-[#14173F] dark:text-[#F1F2FF] leading-relaxed">
                  Siyanda's business shows strong revenue resilience, but stock variance remains a key operational risk. The single highest-leverage action this month is resolving the open stock discrepancy. Doing so would lift documented readiness by 4–6 points.
                </p>
              </div>

              <button
                onClick={() => setExpanded(false)}
                className="text-xs font-bold text-[#5B5BE0] dark:text-[#A9AEFF] hover:underline"
              >
                ← Collapse
              </button>
            </>
          )}
        </div>

        <p className="mt-5 pt-4 border-t border-[#E1E4F7] dark:border-[#2A3070] text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] leading-relaxed">
          This summary is generated from your sealed records and business profile. It is not raw data — verify any specific figure by opening the linked record.
        </p>
      </div>
    </div>
  );
}