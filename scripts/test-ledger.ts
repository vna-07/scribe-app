import { sealRecord, verifyChain, type LedgerRecord } from "../src/lib/ledger";

function sealAll(): LedgerRecord[] {
  const biz = "biz-1";
  const rows: Array<{
    kind: "stock_purchase" | "sale" | "stock_count";
    amount_cents: number;
    quantity: number;
  }> = [
    { kind: "stock_purchase", amount_cents: 42500, quantity: 50 },
    { kind: "sale", amount_cents: 1200, quantity: 1 },
    { kind: "stock_count", amount_cents: 0, quantity: 30 },
  ];

  let head: { seq: number; canonical_hash: string } | null = null;
  const out: LedgerRecord[] = [];

  for (const row of rows) {
    const sealed = sealRecord(head, {
      id: crypto.randomUUID(),
      business_id: biz,
      kind: row.kind,
      amount_cents: row.amount_cents,
      quantity: row.quantity,
      description: `test ${row.kind}`,
      occurred_at: Date.now(),
      source_channel: "web",
      status: "saved",
      evidence_tier: "reported",
    });
    out.push(sealed as LedgerRecord);
    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
  }
  return out;
}

const records = sealAll();

// 1. Pristine chain should verify.
const good = verifyChain(records);
console.log("Pristine chain:", good);
if (!good.ok) throw new Error("expected pristine chain to verify");

// 2. Tamper with record #2's amount.
const tampered = records.map((r) =>
  r.seq === 2 ? { ...r, amount_cents: 99999 } : r
);
const bad = verifyChain(tampered);
console.log("Tampered chain:", bad);
if (bad.ok) throw new Error("expected tampered chain to FAIL");

// 3. Restore and re-verify.
const restored = verifyChain(records);
console.log("Restored chain:", restored);
if (!restored.ok) throw new Error("expected restored chain to verify");

console.log("\n✓ Ledger works: signs, chains, verifies, and detects tampering.");