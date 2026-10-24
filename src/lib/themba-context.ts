import type { LedgerRecord } from "./ledger";
import { reconcileStock, revenueRange } from "./reconcile";
import { consistencyScore } from "./score";

export interface ConversationTurn {
  role: "user" | "themba";
  text: string;
}

export function buildRichContext(
  records: LedgerRecord[],
  businessName: string,
  history: ConversationTurn[]
) {
  const stock = reconcileStock(records);
  const revenue = revenueRange(records);
  const score = consistencyScore(records);

  const sales = records.filter((r) => r.kind === "sale");
  const expenses = records.filter((r) => r.kind === "expense");
  const purchases = records.filter((r) => r.kind === "stock_purchase");

  const days = new Set(
    sales.map((s) => new Date(s.occurred_at).toISOString().slice(0, 10))
  ).size;

  const expenseByCategory: Record<string, number> = {};
  for (const e of expenses) {
    const key = e.description.split(" ").slice(0, 2).join(" ") || "Other";
    expenseByCategory[key] = (expenseByCategory[key] ?? 0) + e.amount_cents;
  }

  return {
    business: businessName,
    record_count: records.length,

    stock_flow: {
      opening: stock.opening,
      received: stock.received,
      sold: stock.sold,
      losses: stock.losses,
      expected: stock.expected,
      counted: stock.counted,
      variance: stock.variance,
      sufficient_evidence: stock.sufficient_evidence,
      note: stock.note,
    },

    revenue: {
      low_rands: revenue.low_cents / 100,
      high_rands: revenue.high_cents / 100,
      sufficient: revenue.sufficient_evidence,
      method: revenue.method,
    },

    score: {
      low: score.low,
      high: score.high,
      components: score.components.map((c) => ({
        label: c.label,
        value_pct: Math.round(c.value * 100),
        evidence: c.evidence_note,
      })),
      counterfactuals: score.counterfactuals,
      framing: score.framing,
    },

    counts: {
      sale_records: sales.length,
      expense_records: expenses.length,
      purchase_records: purchases.length,
      distinct_sale_days: days,
    },

    expense_categories: expenseByCategory,

    recent_records: records.slice(-15).map((r) => ({
      seq: r.seq,
      kind: r.kind,
      amount_rands: r.amount_cents / 100,
      quantity: r.quantity,
      date: new Date(r.occurred_at).toISOString().slice(0, 10),
      description: r.description,
      evidence_tier: r.evidence_tier,
      status: r.status,
    })),

    // Record numbers the user might have referenced; helps the model cite correctly
    available_record_numbers: records.map((r) => r.seq).sort((a, b) => a - b),

    conversation: history.slice(-6),
  };
}