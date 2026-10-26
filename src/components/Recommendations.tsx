"use client";

import { useState } from "react";
import { rands } from "@/lib/format";
import type { BusinessStockState, ProductState } from "@/lib/stock-state";

type Severity = "urgent" | "action" | "monitor";
type RecType = "stock_risk" | "slow_mover" | "dead_capital" | "margin_review";

interface Recommendation {
  id: string;
  type: RecType;
  severity: Severity;
  title: string;
  reason: string;
  evidence: { label: string; value: string }[];
  confidence: "high" | "medium" | "low";
  impact: string;
  downside: string;
  action: string;
  productId?: string;
}

function buildRecommendations(
  products: ProductState[],
  salesMap: Map<string, { units: number; revenue: number }>
): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const p of products) {
    const sales = salesMap.get(p.name) || { units: 0, revenue: 0 };

    // 1. Stock risk — expected balance below reorder threshold
    if (p.reorder_threshold > 0 && p.expected > 0 && p.expected <= p.reorder_threshold) {
      recs.push({
        id: `stock_${p.id}`,
        type: "stock_risk",
        severity: p.expected <= p.reorder_threshold * 0.5 ? "urgent" : "action",
        title: `Reorder ${p.name} soon`,
        reason:
          `Current expected balance of ${p.expected} ${p.unit}s is at or below your reorder threshold of ${p.reorder_threshold}. Without a delivery, you may run out before restocking.`,
        evidence: [
          { label: "Expected balance", value: `${p.expected} ${p.unit}s` },
          { label: "Reorder threshold", value: `${p.reorder_threshold} ${p.unit}s` },
          { label: "Units sold (period)", value: `${sales.units}` },
          { label: "Supplier lead time", value: "Not recorded" },
        ],
        confidence: "medium",
        impact: `Prevents stockouts on a product that sold ${sales.units} units in the last period.`,
        downside: "Over-ordering ties up cash you could deploy elsewhere.",
        action: "Draft Purchase Order",
        productId: p.id,
      });
    }

    // 2. Slow movers — high expected balance but zero sales in the period
    if (p.expected > 20 && sales.units === 0) {
      recs.push({
        id: `slow_${p.id}`,
        type: "slow_mover",
        severity: "action",
        title: `Review ${p.name}`,
        reason:
          `${p.expected} ${p.unit}s are held in stock with no recorded sales in the selected period. This may be overstocking, dead stock, or a data gap.`,
        evidence: [
          { label: "Expected balance", value: `${p.expected} ${p.unit}s` },
          { label: "Units sold (period)", value: "0" },
          { label: "Unit cost", value: p.cost_price_cents ? rands(p.cost_price_cents) : "Unknown" },
          { label: "Capital tied up", value: p.cost_price_cents ? rands(p.cost_price_cents * p.expected) : "Unknown" },
        ],
        confidence: "medium",
        impact: p.cost_price_cents
          ? `Potentially unlocks ${rands(p.cost_price_cents * p.expected)} of working capital if sales velocity is genuinely zero.`
          : "Could unlock working capital if sales velocity is genuinely zero.",
        downside:
          "Demand may be seasonal. Review past years before discontinuing or discounting.",
        action: "Investigate",
        productId: p.id,
      });
    }

    // 3. Dead capital — high unit value, low sales volume, held for long
    if (
      p.expected > 50 &&
      sales.units > 0 &&
      sales.units < 5 &&
      p.expected * (p.cost_price_cents || 0) > 200000 // over R2,000 tied up
    ) {
      recs.push({
        id: `dead_${p.id}`,
        type: "dead_capital",
        severity: "monitor",
        title: `Cash tied up in ${p.name}`,
        reason:
          `${rands(p.cost_price_cents! * p.expected)} is held in stock but only ${sales.units} unit${sales.units === 1 ? "" : "s"} sold in the period. This is working capital that could be redeployed.`,
        evidence: [
          { label: "Capital tied up", value: rands(p.cost_price_cents! * p.expected) },
          { label: "Units held", value: `${p.expected}` },
          { label: "Units sold", value: `${sales.units}` },
        ],
        confidence: "medium",
        impact: "Reducing future orders could free up meaningful cash.",
        downside: "Reducing orders too aggressively may cause stockouts if demand returns.",
        action: "Review reorder policy",
        productId: p.id,
      });
    }
  }

  // Sort by severity
  const order: Record<Severity, number> = { urgent: 0, action: 1, monitor: 2 };
  return recs.sort((a, b) => order[a.severity] - order[b.severity]);
}

interface RecommendationCardsProps {
  stockState: BusinessStockState;
  chartRecords: { kind: string; description: string; amount_cents: number }[];
}

export default function RecommendationCards({ stockState, chartRecords }: RecommendationCardsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Build sales map keyed by product name (from "Sale: Nx SKU" descriptions)
  const salesMap = new Map<string, { units: number; revenue: number }>();
  for (const r of chartRecords) {
    if (r.kind !== "sale") continue;
    const m = r.description.match(/Sale: (\d+)x (.+)/);
    if (!m) continue;
    const units = parseInt(m[1]);
    const sku = m[2];
    const cur = salesMap.get(sku) || { units: 0, revenue: 0 };
    cur.units += units;
    cur.revenue += r.amount_cents;
    salesMap.set(sku, cur);
  }

  const recs = buildRecommendations(stockState.products, salesMap).filter(
    (r) => !dismissed.has(r.id)
  );

  if (recs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#47745D]/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#47745D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg mb-1">You&apos;re looking good.</h3>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] max-w-md mx-auto leading-relaxed">
          No significant issues detected in your latest records. Your stock, sales, and cash flow are within their current monitoring thresholds. We&apos;ll flag anything that needs your attention.
        </p>
      </div>
    );
  }

  const severityStyles: Record<Severity, { bg: string; border: string; badge: string; label: string }> = {
    urgent: {
      bg: "bg-[#B3261E]/5 dark:bg-[#B3261E]/10",
      border: "border-[#B3261E]",
      badge: "bg-[#B3261E] text-white",
      label: "Urgent",
    },
    action: {
      bg: "bg-[#FFF0C4]/30 dark:bg-[#4A3B10]/30",
      border: "border-[#D99A00]",
      badge: "bg-[#D99A00] text-white",
      label: "Action",
    },
    monitor: {
      bg: "bg-[#5B5BE0]/5 dark:bg-[#5B5BE0]/10",
      border: "border-[#5B5BE0]",
      badge: "bg-[#5B5BE0] text-white",
      label: "Monitor",
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg">Themba&apos;s Recommendations</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">
            Based on your sealed records. Every card is deterministic — nothing is invented.
          </p>
        </div>
        <span className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5]">
          {recs.length} item{recs.length === 1 ? "" : "s"}
        </span>
      </div>

      {recs.map((rec) => {
        const s = severityStyles[rec.severity];
        const isExpanded = expanded.has(rec.id);

        return (
          <div
            key={rec.id}
            className={`${s.bg} border-l-4 ${s.border} rounded-xl p-5 shadow-sm transition-all`}
          >
            <div className="flex justify-between items-start gap-3 mb-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded shrink-0 ${s.badge}`}>
                  {s.label}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-[#14173F] dark:text-white text-sm">{rec.title}</h4>
                  <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mt-1 leading-relaxed">{rec.reason}</p>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4 pl-3 border-l-2 border-[#E1E4F7] dark:border-[#2A3070]">
                {/* Evidence */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-2">Evidence</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {rec.evidence.map((e, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-[#5A5F8C] dark:text-[#C5C9F5]">{e.label}</span>
                        <span className="font-bold text-[#14173F] dark:text-white tabular-nums">{e.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact / Downside */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/60 dark:bg-[#14173F]/60 rounded-lg p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#47745D] mb-1">Estimated impact</p>
                    <p className="text-xs text-[#14173F] dark:text-white leading-relaxed">{rec.impact}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-[#14173F]/60 rounded-lg p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#D99A00] mb-1">Potential downside</p>
                    <p className="text-xs text-[#14173F] dark:text-white leading-relaxed">{rec.downside}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-[#5A5F8C] dark:text-[#C5C9F5]">
                  <span>Confidence:</span>
                  <span className={`px-2 py-0.5 rounded ${
                    rec.confidence === "high" ? "bg-[#47745D]/10 text-[#47745D]" :
                    rec.confidence === "medium" ? "bg-[#D99A00]/10 text-[#D99A00]" :
                    "bg-[#B3261E]/10 text-[#B3261E]"
                  }`}>{rec.confidence}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => {
                  // Save action as a Growth Studio task
                  const businessId = window.location.pathname.split("/").pop();
                  fetch("/api/goals", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      action: "create_goal",
                      business_id: businessId,
                      title: rec.action + ": " + rec.title,
                      description: rec.reason + " Impact: " + rec.impact,
                      target_value: null,
                    }),
                  }).then(() => {
                    setDismissed(prev => new Set(prev).add(rec.id));
                  });
                }}
                className="px-4 py-2 bg-[#5B5BE0] text-white text-xs font-bold rounded-lg hover:bg-[#4B4FC9] transition-colors"
              >
                {rec.action}
              </button>
              <button
                onClick={() => setExpanded(prev => {
                  const next = new Set(prev);
                  if (isExpanded) next.delete(rec.id); else next.add(rec.id);
                  return next;
                })}
                className="px-4 py-2 bg-white dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#3A4080] text-[#4A4F7A] dark:text-[#C5C9F5] text-xs font-bold rounded-lg hover:text-[#14173F] dark:hover:text-white transition-colors"
              >
                {isExpanded ? "Hide details" : "Show evidence"}
              </button>
              <button
                onClick={() => setDismissed(prev => new Set(prev).add(rec.id))}
                className="px-4 py-2 text-[#5A5F8C] dark:text-[#C5C9F5] hover:text-[#14173F] dark:hover:text-white text-xs font-bold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}