"use client";

import { useState } from "react";
import type { DemoData } from "@/lib/demo-data";
import { rands } from "@/lib/format";
import { generateAnalytics } from "@/lib/analytics";
import ScoreExplainer from "@/components/ScoreExplainer";

export default function IntelligenceTab({ data, onRefresh }: { data: DemoData; onRefresh: () => void }) {
  const [showExplainer, setShowExplainer] = useState(false);
  const { dailyData, expenseCategories } = generateAnalytics(
    data.recentRecords.map(r => ({ ...r, prev_hash: "", canonical_hash: "", signature: "", business_id: data.businessId })) as any
  );

  const totalSales = dailyData.reduce((s, d) => s + d.sales, 0);
  const totalExpenses = dailyData.reduce((s, d) => s + d.expenses, 0);
  const netCashFlow = totalSales - totalExpenses;

  const maxVal = Math.max(...dailyData.map(d => Math.max(d.sales, d.expenses)), 100);

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Business Intelligence</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Financial performance and analytics.</p>
        </div>
        <button 
          onClick={() => setShowExplainer(true)}
          className="px-4 py-2 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] rounded-lg text-sm font-bold hover:bg-[#E1E4F7] dark:hover:bg-[#3A4080] transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          How is my score calculated?
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider mb-1">Total Recorded Sales (14d)</p>
          <p className="text-2xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(totalSales * 100)}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider mb-1">Total Recorded Expenses (14d)</p>
          <p className="text-2xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(totalExpenses * 100)}</p>
        </div>
        <div className="bg-[#14173F] dark:bg-[#0E1130] p-5 rounded-2xl border border-[#2A3070]">
          <p className="text-xs font-bold text-[#A9AEFF] uppercase tracking-wider mb-1">Net Cash Flow (14d)</p>
          <p className={`text-2xl font-extrabold tabular-nums ${netCashFlow >= 0 ? "text-[#A9AEFF]" : "text-[#FF8A80]"}`}>
            {netCashFlow >= 0 ? "+" : ""}{rands(netCashFlow * 100)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Cash Flow Timeline</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Money in vs money out over the last 14 days.</p>
          
          <div className="flex items-end justify-between h-48 gap-2">
            {dailyData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-16 bg-[#14173F] text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Sales: {rands(d.sales * 100)}<br/>Exp: {rands(d.expenses * 100)}
                </div>
                
                <div className="w-full flex justify-center gap-[2px] h-full items-end">
                  <div className="w-1/2 bg-[#5B5BE0] dark:bg-[#A9AEFF] rounded-t-sm" style={{ height: `${(d.sales / maxVal) * 100}%` }} />
                  <div className="w-1/2 bg-[#E1E4F7] dark:bg-[#2A3070] rounded-t-sm" style={{ height: `${(d.expenses / maxVal) * 100}%` }} />
                </div>
                <span className="text-[9px] font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Expense Composition</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Where your money is going.</p>
          
          <div className="space-y-4">
            {expenseCategories.slice(0, 4).map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-[#14173F] dark:text-white">{c.label}</span>
                  <span className="font-bold text-[#4A4F7A] dark:text-[#C5C9F5] tabular-nums">{rands(c.amount * 100)}</span>
                </div>
                <div className="h-2 w-full bg-[#E1E4F7] dark:bg-[#2A3070] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.amount / totalExpenses) * 100}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <p className="text-sm text-[#5A5F8C] dark:text-[#C5C9F5]">No expenses recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {showExplainer && <ScoreExplainer data={data} onClose={() => setShowExplainer(false)} />}
    </div>
  );
}