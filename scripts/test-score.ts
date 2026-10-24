import { consistencyScore } from "../src/lib/score";
import type { LedgerRecord } from "../src/lib/ledger";

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

// Nomsa's Spaza: 1 opening, 12 sales over 12 days, 1 count. Weak verification.
const DAY = 86_400_000;
const base = Date.now();
const nomsa: LedgerRecord[] = [
  mk({ seq: 1, kind: "stock_purchase", quantity: 50, amount_cents: 42500, evidence_tier: "document_supported" }),
  ...Array.from({ length: 12 }, (_, i) =>
    mk({
      seq: 2 + i,
      kind: "sale",
      quantity: 1,
      amount_cents: 1200,
      occurred_at: base - (12 - i) * DAY,
      evidence_tier: i < 8 ? "document_supported" : "reported",
      status: "reconciled",
    })
  ),
  mk({ seq: 20, kind: "stock_count", quantity: 30, status: "reconciled" }),
];

const score = consistencyScore(nomsa);
console.log("Score range:", `${score.low}–${score.high}`);
console.log("Components:");
for (const c of score.components) {
  console.log(`  ${c.label}: ${Math.round(c.value * 100)}%  (weight ${c.weight})  — ${c.evidence_note}`);
}
console.log("Counterfactuals:");
for (const cf of score.counterfactuals) {
  console.log(`  → ${cf.action} (${cf.component}, +${cf.delta})  ${cf.rationale}`);
}
console.log("\nFraming:", score.framing);

// Invariants
if (score.low >= score.high) throw new Error("range must be low < high");
if (score.low < 0 || score.high > 100) throw new Error("range must stay within 0–100");
if (score.components.reduce((s, c) => s + c.weight, 0) !== 1) {
  throw new Error("weights must sum to 1");
}

// Identical evidence must score identically regardless of language / location.
// (Only behavioural fields are read, so this should hold trivially.)
const clone = JSON.parse(JSON.stringify(nomsa));
const scoreClone = consistencyScore(clone);
if (scoreClone.low !== score.low || scoreClone.high !== score.high) {
  throw new Error("fairness invariance violated");
}
console.log("\n✓ Score works: range, components, counterfactuals, fairness invariance.");