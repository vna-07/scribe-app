"use client";

import { useState } from "react";
import type { DemoData } from "@/lib/demo-data";
import { rands } from "@/lib/format";
import { generateAnalytics } from "@/lib/analytics";
import { BarChart, DonutChart } from "@/components/Visuals";
import ScoreExplainer from "@/components/ScoreExplainer";
import RecommendationCards from "@/components/Recommendations";

export default function IntelligenceTab({ data }: { data: DemoData; onRefresh?: () => void }) {
  const [showExplainer, setShowExplainer] = useState(false);

  // ─── FIXED: use chartRecords (500 records) not recentRecords (15) ───
  const { dailyData, expenseCategories } = generateAnalytics(
    data.chartRecords.map(r => ({
      ...r,
      prev_hash: "",
      canonical_hash: "",
      signature: "",
      business_id: data.businessId,
    })) as any
  );

  const totalSales = dailyData.reduce((s, d) => s + d.sales, 0);
  const totalExpenses = dailyData.reduce((s, d) => s + d.expenses, 0);
  const netCashFlow = totalSales - totalExpenses;

  // Low-stock products: expected balance is below the reorder threshold.
  // `reorder_threshold > 0` guards against products with no configured threshold
  // (the import script leaves this at the schema default of 0), which would
  // otherwise all flag as "low stock" whenever their balance is zero.
  const lowStock = data.stockState.products.filter(
    (p) => p.reorder_threshold > 0 && p.expected <= p.reorder_threshold
  );
  const openVariances = data.stockState.products.filter((p) => p.status === "open");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Business Intelligence</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Financial performance and analytics.</p>
        </div>
        <button
          onClick={() => setShowExplainer(true)}
          className="px-4 py-2 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] rounded-lg text-sm font-bold hover:bg-[#E1E4F7] dark:hover:bg-[#3A4080] transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          How is my score calculated?
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider mb-1">Recorded Sales</p>
          <p className="text-2xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(totalSales * 100)}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider mb-1">Recorded Expenses</p>
          <p className="text-2xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(totalExpenses * 100)}</p>
        </div>
        <div className="bg-[#14173F] dark:bg-[#0E1130] p-5 rounded-2xl border border-[#2A3070]">
          <p className="text-xs font-bold text-[#A9AEFF] uppercase tracking-wider mb-1">Net Cash Flow</p>
          <p className={`text-2xl font-extrabold tabular-nums ${netCashFlow >= 0 ? "text-[#A9AEFF]" : "text-[#FF8A80]"}`}>
            {netCashFlow >= 0 ? "+" : ""}{rands(netCashFlow * 100)}
          </p>
        </div>
      </div>

      {/* Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-extrabold text-[#14173F] dark:text-white">Cash Flow Timeline</h3>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mt-0.5">Sales vs expenses over 14 trading days.</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#5B5BE0" }}></span> Sales</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#D99A00", opacity: 0.65 }}></span> Expenses</span>
            </div>
          </div>
          <BarChart data={dailyData} height={220} />
        </div>

        <div className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Expense Composition</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Where your money is going.</p>
          <DonutChart data={expenseCategories} />
        </div>
      </div>

      {/* ─── THEMBA'S RECOMMENDATIONS ─── */}
      <RecommendationCards
        stockState={data.stockState}
        chartRecords={data.chartRecords.map((r) => ({
          kind: r.kind,
          description: r.description,
          amount_cents: r.amount_cents,
        }))}
      />

      {/* Business Decisions panel */}
      {(lowStock.length > 0 || openVariances.length > 0) && (
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6">
          <h3 className="font-extrabold text-lg text-[#14173F] dark:text-white mb-4">Decisions to Review</h3>
          <div className="space-y-2">
            {openVariances.map(p => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-[#F1F2FF] dark:border-[#2A3070] last:border-0">
                <div>
                  <p className="font-bold text-sm text-[#14173F] dark:text-white">{p.name} — {p.variance} units</p>
                  <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">Expected {p.expected} · Counted {p.counted} · Review required</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#D99A00] bg-[#FFF0C4] dark:bg-[#4A3B10] px-2 py-1 rounded-full">Investigate</span>
              </div>
            ))}
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-[#F1F2FF] dark:border-[#2A3070] last:border-0">
                <div>
                  <p className="font-bold text-sm text-[#14173F] dark:text-white">{p.name}</p>
                  <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">Expected balance {p.expected} · reorder threshold {p.reorder_threshold}</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#B3261E] bg-[#B3261E]/10 px-2 py-1 rounded-full">Reorder</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showExplainer && <ScoreExplainer data={data} onClose={() => setShowExplainer(false)} />}
    </div>
  );
}