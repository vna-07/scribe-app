import type { LedgerRecord } from "./ledger";
import { reconcileStock, revenueRange } from "./reconcile";

export interface ScoreComponent {
  key: string;
  label: string;
  weight: number;
  value: number; // 0..1
  evidence_note: string;
}

export interface Counterfactual {
  action: string;
  component: string;
  delta: number;
  rationale: string;
}

export interface ScoreResult {
  low: number;
  high: number;
  components: ScoreComponent[];
  counterfactuals: Counterfactual[];
  framing: string;
}

export function consistencyScore(records: LedgerRecord[]): ScoreResult {
  const active = records.filter((r) => r.status !== "failed");
  const stock = reconcileStock(active);
  const revenue = revenueRange(active);

  const sales = active.filter((r) => r.kind === "sale");
  const distinctDays = new Set(
    sales.map((s) => new Date(s.occurred_at).toISOString().slice(0, 10))
  ).size;
  const depth = Math.min(1, distinctDays / 14);

  const verifiedShare =
    sales.length === 0
      ? 0
      : sales.filter((s) => s.evidence_tier !== "reported").length / sales.length;

  const reconciledShare =
    active.length === 0
      ? 0
      : active.filter((r) => r.status === "reconciled").length / active.length;

  const consistency =
    stock.counted === null
      ? 0.2
      : stock.variance === 0
      ? 1
      : stock.variance !== null && Math.abs(stock.variance) <= 2
      ? 0.6
      : 0.3;

  const cashHealth = revenue.sufficient_evidence
    ? Math.min(1, revenue.low_cents / Math.max(1, revenue.high_cents))
    : 0.2;

  const components: ScoreComponent[] = [
    {
      key: "consistency",
      label: "Stock consistency",
      weight: 0.25,
      value: consistency,
      evidence_note:
        stock.variance === null
          ? "No stock count recorded"
          : `Variance ${stock.variance} units against expected ${stock.expected}`,
    },
    {
      key: "depth",
      label: "Record depth",
      weight: 0.15,
      value: depth,
      evidence_note: `${distinctDays} distinct day${distinctDays === 1 ? "" : "s"} of sales recorded`,
    },
    {
      key: "verification",
      label: "Verification quality",
      weight: 0.2,
      value: verifiedShare,
      evidence_note:
        sales.length === 0
          ? "No sales to verify"
          : `${Math.round(verifiedShare * 100)}% of sales are documented or counter-signed`,
    },
    {
      key: "reconciliation",
      label: "Reconciliation coverage",
      weight: 0.2,
      value: reconciledShare,
      evidence_note: `${Math.round(reconciledShare * 100)}% of records reconciled`,
    },
    {
      key: "cashflow",
      label: "Cash-flow evidence",
      weight: 0.2,
      value: cashHealth,
      evidence_note: revenue.sufficient_evidence
        ? `Revenue range R${(revenue.low_cents / 100).toFixed(0)}–R${(
            revenue.high_cents / 100
          ).toFixed(0)}`
        : "Insufficient sale records",
    },
  ];

  const point = components.reduce((s, c) => s + c.weight * c.value, 0);
  const low = Math.max(0, Math.round(point * 100 - 8));
  const high = Math.min(100, Math.round(point * 100 + 8));

  const counterfactuals: Counterfactual[] = [];

  if (stock.counted === null) {
    counterfactuals.push({
      action: "Record one physical stock count",
      component: "Stock consistency",
      delta: Number((0.25 * (0.6 - 0.2)).toFixed(3)),
      rationale:
        "A count enables variance to be computed at all. Without it, this component stays at 0.20.",
    });
  }
  if (verifiedShare < 0.5 && sales.length > 0) {
    counterfactuals.push({
      action: "Attach a document to three sale records",
      component: "Verification quality",
      delta: Number((0.2 * (0.5 - verifiedShare)).toFixed(3)),
      rationale:
        "Document-supported entries narrow the revenue range and raise confidence.",
    });
  }
  if (distinctDays < 7) {
    counterfactuals.push({
      action: "Record sales on 7 different days",
      component: "Record depth",
      delta: Number((0.15 * (7 / 14 - depth)).toFixed(3)),
      rationale:
        "Steadier records support a more confident assessment than a single high-volume day.",
    });
  }
  if (stock.counted !== null && stock.variance !== null && stock.variance !== 0) {
    counterfactuals.push({
      action: `Investigate the ${Math.abs(stock.variance)}-unit variance and record what happened`,
      component: "Stock consistency",
      delta: Number((0.25 * (1 - consistency)).toFixed(3)),
      rationale:
        "Recording the cause (unrecorded sale, loss, or corrected count) reconciles the books and raises stock consistency.",
    });
  }

  return {
    low,
    high,
    components,
    counterfactuals,
    framing:
      "This is a measure of documented readiness, not a credit score and not a prediction of repayment. It is shown as a range because evidence is incomplete.",
  };
}