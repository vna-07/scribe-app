"use client";

import type { DemoData } from "@/lib/demo-data";

export default function ScoreExplainer({ data, onClose }: { data: DemoData, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#14173F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] w-full max-w-2xl rounded-[28px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white">How Readiness is Calculated</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">A transparent breakdown of the evidence quality.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] rounded-lg transition-colors text-[#5A5F8C]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-6 mb-8 text-center">
          <p className="text-sm font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider mb-2">Final Score Range</p>
          <p className="text-4xl font-extrabold text-[#5B5BE0] dark:text-[#A9AEFF] tabular-nums">
            {data.score.low} – {data.score.high} <span className="text-xl text-[#5A5F8C] dark:text-[#A9AEFF]">/ 100</span>
          </p>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mt-2 max-w-md mx-auto">{data.score.framing}</p>
        </div>

        <h3 className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-widest mb-3">Component Weights & Rules</h3>
        
        <div className="space-y-4 mb-8">
          {data.score.components.map((c) => (
            <div key={c.key} className="bg-white dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#2A3070] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[#14173F] dark:text-white">{c.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5]">Weight: {(c.weight * 100).toFixed(0)}%</span>
                  <span className="text-sm font-extrabold text-[#5B5BE0] dark:text-[#A9AEFF] tabular-nums">{Math.round(c.value * 100)} / 100</span>
                </div>
              </div>
              <div className="h-2 w-full bg-[#E1E4F7] dark:bg-[#2A3070] rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#5B5BE0] dark:bg-[#A9AEFF] rounded-full" style={{ width: `${Math.max(2, c.value * 100)}%` }} />
              </div>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
                <strong className="text-[#14173F] dark:text-white">Rule:</strong> {c.evidence_note}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] border border-[#D99A00] rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-[#D99A00] dark:text-[#F2B84B] uppercase tracking-wider mb-1">How to improve</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-[#1D2260] dark:text-[#F1F2FF]">
            {data.score.counterfactuals.map((cf, i) => (
              <li key={i}>{cf.action} <span className="text-xs font-bold text-[#47745D] dark:text-[#A9AEFF]">(+{cf.delta.toFixed(2)})</span></li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center text-xs text-[#5A5F8C] dark:text-[#C5C9F5] border-t border-[#E1E4F7] dark:border-[#2A3070] pt-4">
          <p>Records analysed: {data.recordCount}</p>
          <p>Calculation: Deterministic logic</p>
        </div>
      </div>
    </div>
  );
}