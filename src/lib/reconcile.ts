import type { LedgerRecord } from "./ledger";

export interface StockFlow {
  opening: number;
  received: number;
  sold: number;
  losses: number;
  expected: number;
  counted: number | null;
  variance: number | null;
  sufficient_evidence: boolean;
  note: string;
}

/**
 * Split stock purchases into "opening" (first purchase) and "received" (all later purchases).
 * Convention: the lowest seq stock_purchase is the opening balance.
 */
function splitPurchases(records: LedgerRecord[]): { opening: number; received: number } {
  const purchases = records
    .filter((r) => r.kind === "stock_purchase" && r.status !== "failed")
    .sort((a, b) => a.seq - b.seq);

  if (purchases.length === 0) return { opening: 0, received: 0 };

  const opening = purchases[0].quantity ?? 0;
  const received = purchases
    .slice(1)
    .reduce((s, r) => s + (r.quantity ?? 0), 0);

  return { opening, received };
}

/**
 * Deterministic stock-flow reconciliation.
 *   Expected = Opening + Received − Sold − Losses
 *   Variance = Counted − Expected
 * The variance is a review signal, never a fraud verdict.
 */
export function reconcileStock(records: LedgerRecord[]): StockFlow {
  const active = records.filter((r) => r.status !== "failed");
  const { opening, received } = splitPurchases(active);

  const sold = active
    .filter((r) => r.kind === "sale")
    .reduce((s, r) => s + (r.quantity ?? 0), 0);

  const losses = active
    .filter((r) => r.kind === "loss")
    .reduce((s, r) => s + (r.quantity ?? 0), 0);

  const counts = active
    .filter((r) => r.kind === "stock_count")
    .sort((a, b) => b.seq - a.seq); // latest count wins

  const counted = counts.length > 0 ? counts[0].quantity ?? null : null;

  const expected = opening + received - sold - losses;
  const variance = counted === null ? null : counted - expected;

  let note: string;
  if (counts.length === 0) {
    note = "No physical stock count recorded. Variance cannot be computed — this is a question, not a finding.";
  } else if (opening === 0) {
    note = "No opening stock recorded. Expected balance cannot be established.";
  } else if (variance === 0) {
    note = "Recorded stock matches physical count. No variance.";
  } else {
    note =
      "Variance is a review signal, not evidence of loss or fraud. Check for unrecorded sales, damaged goods, or an incorrect count before adjusting.";
  }

  return {
    opening,
    received,
    sold,
    losses,
    expected,
    counted,
    variance,
    sufficient_evidence: counted !== null && opening > 0,
    note,
  };
}

export interface RevenueRange {
  low_cents: number;
  high_cents: number;
  method: string;
  sufficient_evidence: boolean;
}

/**
 * Revenue as a range reflecting evidence quality.
 * Reported-only entries widen the range; documented or counter-signed entries narrow it.
 * Never returns a point estimate when evidence is thin.
 */
export function revenueRange(records: LedgerRecord[]): RevenueRange {
  const sales = records.filter((r) => r.kind === "sale" && r.status !== "failed");

  if (sales.length === 0) {
    return {
      low_cents: 0,
      high_cents: 0,
      method: "no sale records",
      sufficient_evidence: false,
    };
  }

  const total = sales.reduce((s, r) => s + r.amount_cents, 0);
  const reported = sales.filter((s) => s.evidence_tier === "reported").length;
  const reportedShare = reported / sales.length;

  // Base ±5% spread; each reported-only sale adds up to ±20% more.
  const spread = Math.round(total * (0.05 + 0.2 * reportedShare));

  return {
    low_cents: Math.max(0, total - spread),
    high_cents: total + spread,
    method: `${sales.length} sale records; ${reported} reported-only, ${
      sales.length - reported
    } documented or counter-signed`,
    sufficient_evidence: true,
  };
}