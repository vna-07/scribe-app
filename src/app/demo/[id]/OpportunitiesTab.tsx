"use client";

import { useState } from "react";
import { rands } from "@/lib/format";
import StartBusinessFlow from "@/components/StartBusinessFlow";

export default function OpportunitiesTab({ businessId }: { businessId: string }) {
  const [activeTab, setActiveTab] = useState<"start" | "expand" | "funding">("expand");
  const [showStartFlow, setShowStartFlow] = useState(false);

  // ─── FINANCIAL LAB STATE ───
  const [income, setIncome] = useState(12000);
  const [expenses, setExpenses] = useState(7000);
  const [allocation, setAllocation] = useState(30);
  const [period, setPeriod] = useState(12);
  const [reserveTarget, setReserveTarget] = useState(3); // in months

  // ─── FINANCIAL LAB MATH ───
  const monthlySurplus = Math.max(0, income - expenses);
  const cashReserve = expenses * reserveTarget;
  const allocatedMonthly = monthlySurplus * (allocation / 100);
  const potentialCapital = allocatedMonthly * period;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Business Launch Studio</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Plan, fund, and grow your next venture.</p>
      </div>

      {/* 3 Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button onClick={() => setShowStartFlow(true)} className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "start" ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF]"}`}>
          <div className="w-10 h-10 rounded-xl bg-[#5B5BE0] text-white flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Start a Business</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Turn an idea into an actionable launch plan.</p>
        </button>

        <button onClick={() => setActiveTab("expand")} className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "expand" ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF]"}`}>
          <div className="w-10 h-10 rounded-xl bg-[#47745D] text-white flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Expand My Business</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Use your current profits to fund growth.</p>
        </button>

        <button onClick={() => setActiveTab("funding")} className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "funding" ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF]"}`}>
          <div className="w-10 h-10 rounded-xl bg-[#D99A00] text-white flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Find Funding</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Discover grants and youth programmes.</p>
        </button>
      </div>

      {showStartFlow && (
        <StartBusinessFlow onClose={() => setShowStartFlow(false)} />
      )}

      {/* ─── EXPAND MODE: THE FINANCIAL LAB ─── */}
      {activeTab === "expand" && (
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-[#14173F] dark:text-white">Business Reinvestment Simulator</h3>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mt-1">Explore how your surplus can fund a new venture.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A00] bg-[#FFF0C4] dark:bg-[#4A3B10] px-2 py-1 rounded">Interactive Model</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Inputs */}
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#14173F] dark:text-white">Monthly income (R)</span>
                  <span className="text-[#5B5BE0] tabular-nums">{rands(income * 100)}</span>
                </div>
                <input type="range" min="2000" max="50000" step="500" value={income} onChange={e => setIncome(Number(e.target.value))} className="w-full accent-[#5B5BE0]" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#14173F] dark:text-white">Monthly expenses (R)</span>
                  <span className="text-[#5B5BE0] tabular-nums">{rands(expenses * 100)}</span>
                </div>
                <input type="range" min="1000" max="30000" step="500" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full accent-[#5B5BE0]" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#14173F] dark:text-white">Profit allocated to new business (%)</span>
                  <span className="text-[#5B5BE0] tabular-nums">{allocation}%</span>
                </div>
                <input type="range" min="0" max="80" step="5" value={allocation} onChange={e => setAllocation(Number(e.target.value))} className="w-full accent-[#5B5BE0]" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#14173F] dark:text-white">Capital-building period (months)</span>
                  <span className="text-[#5B5BE0] tabular-nums">{period}</span>
                </div>
                <input type="range" min="3" max="24" step="1" value={period} onChange={e => setPeriod(Number(e.target.value))} className="w-full accent-[#5B5BE0]" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#14173F] dark:text-white">Cash reserve target (months)</span>
                  <span className="text-[#5B5BE0] tabular-nums">{reserveTarget}</span>
                </div>
                <input type="range" min="1" max="6" step="1" value={reserveTarget} onChange={e => setReserveTarget(Number(e.target.value))} className="w-full accent-[#5B5BE0]" />
              </div>
            </div>

            {/* Outputs */}
            <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[#E1E4F7] dark:border-[#3A4080] pb-2">
                <span className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5]">Monthly surplus</span>
                <span className="text-lg font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(monthlySurplus * 100)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E1E4F7] dark:border-[#3A4080] pb-2">
                <span className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5]">Target cash reserve</span>
                <span className="text-lg font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(cashReserve * 100)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-[#5B5BE0] dark:text-[#A9AEFF]">Potential new-business capital</span>
                <span className="text-2xl font-extrabold text-[#5B5BE0] dark:text-[#A9AEFF] tabular-nums">{rands(potentialCapital * 100)}</span>
              </div>
              <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] leading-relaxed mt-2">
                Over {period} months. Simplified model: assumes income minus expenses is constant. Does not account for taxes, debt, or unexpected expenses. Actual capital should be calculated after essential obligations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── FUNDING MODE ─── */}
      {activeTab === "funding" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] px-2 py-1 rounded">Grant</span>
              </div>
              <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg leading-tight mb-1">NYDA Grant Programme</h3>
              <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mb-4">National Youth Development Agency</p>
              <p className="text-sm font-bold text-[#14173F] dark:text-white mb-2">Value: R1,000 - R250,000</p>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-4">Youth-focused grants and non-financial business-development support. Eligibility rules apply.</p>
            </div>
            <a href="https://www.nyda.gov.za" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 bg-[#5B5BE0] text-white text-sm font-bold rounded-lg hover:bg-[#4B4FC9] transition-colors">View Official Site ↗</a>
          </div>

          <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] px-2 py-1 rounded">Loan</span>
              </div>
              <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg leading-tight mb-1">SEDFA Small Business Loan</h3>
              <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mb-4">Small Enterprise Development Agency</p>
              <p className="text-sm font-bold text-[#14173F] dark:text-white mb-2">Value: Up to R15M</p>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-4">Finance and development support for eligible SMEs with trading history.</p>
            </div>
            <a href="https://www.onesedfa.org.za" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 bg-[#5B5BE0] text-white text-sm font-bold rounded-lg hover:bg-[#4B4FC9] transition-colors">View Official Site ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}