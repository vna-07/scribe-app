import { reconcileStock, revenueRange } from "../src/lib/reconcile";
import type { LedgerRecord } from "../src/lib/ledger";

/** Build a LedgerRecord with sensible defaults. Hash/sig fields unused by reconciliation. */
function mk(over: Partial<LedgerRecord>): LedgerRecord {
  return {
    id: crypto.randomUUID(),
    business_id: "b",
    seq: 0,
    kind: "sale",
    amount_cents: 0,
    quantity: null,
    description: "",
    occurred_at: 0,
    source_channel: "demo",
    status: "saved",
    evidence_tier: "reported",
    prev_hash: "",
    canonical_hash: "placeholder",
    signature: "placeholder",
    ...over,
  };
}

// ── Test 1: The exact 8-unit discrepancy from the demo seed ──
const demoRecords: LedgerRecord[] = [
  mk({ seq: 1, kind: "stock_purchase", quantity: 50, amount_cents: 42500 }),
  ...Array.from({ length: 12 }, (_, i) =>
    mk({ seq: 2 + i, kind: "sale", quantity: 1, amount_cents: 1200 })
  ),
  mk({ seq: 20, kind: "stock_count", quantity: 30 }),
];

const stock = reconcileStock(demoRecords);
console.log("Demo stock flow:", {
  opening: stock.opening,
  sold: stock.sold,
  expected: stock.expected,
  counted: stock.counted,
  variance: stock.variance,
});

if (stock.opening !== 50) throw new Error(`opening: expected 50, got ${stock.opening}`);
if (stock.sold !== 12) throw new Error(`sold: expected 12, got ${stock.sold}`);
if (stock.expected !== 38) throw new Error(`expected: 50 − 12 = 38, got ${stock.expected}`);
if (stock.counted !== 30) throw new Error(`counted: expected 30, got ${stock.counted}`);
if (stock.variance !== -8) throw new Error(`variance: 30 − 38 = −8, got ${stock.variance}`);
console.log("✓ 8-unit discrepancy detected (expected 38, counted 30, variance −8)");

// ── Test 2: Refuses to invent variance when no count exists ──
const noCount = [mk({ seq: 1, kind: "stock_purchase", quantity: 50 })];
const r2 = reconcileStock(noCount);
if (r2.variance !== null) throw new Error("should refuse variance without a count");
if (r2.sufficient_evidence) throw new Error("should mark evidence as insufficient");
console.log("✓ Refuses variance when no count exists");

// ── Test 3: Refuses to invent revenue when no sales exist ──
const noSales = [mk({ seq: 1, kind: "stock_purchase", quantity: 50 })];
const r3 = revenueRange(noSales);
if (r3.sufficient_evidence) throw new Error("should refuse revenue without sales");
console.log("✓ Refuses revenue estimate when no sales exist");

// ── Test 4: Revenue range widens with weak evidence ──
const strong = revenueRange([
  mk({ amount_cents: 10000, evidence_tier: "counter_signed" }),
  mk({ amount_cents: 10000, evidence_tier: "counter_signed" }),
]);
const weak = revenueRange([
  mk({ amount_cents: 10000, evidence_tier: "reported" }),
  mk({ amount_cents: 10000, evidence_tier: "reported" }),
]);
const strongSpread = strong.high_cents - strong.low_cents;
const weakSpread = weak.high_cents - weak.low_cents;
if (weakSpread <= strongSpread) {
  throw new Error(`weak spread ${weakSpread} should exceed strong spread ${strongSpread}`);
}
console.log(
  `✓ Revenue range widens with weak evidence (strong ±R${strongSpread / 100}, weak ±R${weakSpread / 100})`
);

console.log("\n✓ Reconciliation engine works end-to-end.");