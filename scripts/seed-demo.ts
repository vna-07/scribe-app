import { db, nowMs, uuid } from "../src/lib/db";
import { sealRecord, verifyChain, type LedgerRecord } from "../src/lib/ledger";
import { reconcileStock } from "../src/lib/reconcile";
import { scryptSync, randomBytes } from "node:crypto";

const DAY = 86_400_000;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const demoEmail = process.env.DEMO_EMAIL ?? "demo@scribe.co.za";
  const demoPassword = process.env.DEMO_PASSWORD ?? "DemoTrader2026!";

  // Idempotent: if the demo user exists, do nothing.
  const existing = await db().execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [demoEmail],
  });
  if (existing.rows.length > 0) {
    console.log(`✓ Demo already seeded (user ${existing.rows[0].id})`);
    return;
  }

  const userId = uuid();
  const bizId = uuid();
  const now = nowMs();

  // ─── 1. User ────────────────────────────────────────────
  await db().execute({
    sql: `INSERT INTO users
          (id, name, email, password_hash, email_verified_at, is_demo, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [userId, "Nomsa Dlamini", demoEmail, hashPassword(demoPassword), now, 1, now],
  });

  // ─── 2. Business ────────────────────────────────────────
  await db().execute({
    sql: `INSERT INTO businesses
          (id, name, business_type, location, currency, trading_since, operating_notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      bizId,
      "Nomsa's Spaza",
      "Spaza shop",
      "Makhanda, Eastern Cape",
      "ZAR",
      "2023-04",
      "Cash-based. Airtime, bread, cold drinks, household staples. Composite demo business — no real trader data.",
      now,
    ],
  });

  // ─── 3. Membership ──────────────────────────────────────
  await db().execute({
    sql: `INSERT INTO business_members (business_id, user_id, role) VALUES (?, ?, ?)`,
    args: [bizId, userId, "owner"],
  });

  // ─── 4. Records (sealed into the chain in order) ────────
  //
  // Design:
  //   - 1 opening stock (50 units of "Airtime voucher R10")
  //   - 12 tracked sales of that product (quantity 1 each)
  //   - 2 untracked bulk sales (quantity null → don't affect reconciliation)
  //   - 2 expenses
  //   - 1 physical count (30 units)
  //
  // Reconciliation output: expected 38, counted 30, variance −8.
  //
  const rows: Array<{
    kind: "stock_purchase" | "sale" | "expense" | "stock_count" | "loss";
    qty: number | null;
    amt: number;
    desc: string;
    daysAgo: number;
    tier: "reported" | "document_supported" | "counter_signed";
    status: "saved" | "reconciled";
  }> = [
    {
      kind: "stock_purchase",
      qty: 50,
      amt: 42500,
      desc: "Opening stock — Airtime voucher R10 (50 units)",
      daysAgo: 30,
      tier: "document_supported",
      status: "saved",
    },
    ...Array.from({ length: 12 }, (_, i) => ({
      kind: "sale" as const,
      qty: 1,
      amt: 1200,
      desc: `Cash sale — Airtime voucher R10`,
      daysAgo: 27 - i * 2,
      tier: "document_supported" as const,
      status: "saved" as const,
    })),
    {
      kind: "sale",
      qty: null,
      amt: 1_200_000,
      desc: "Bread sales for the month (aggregated — not stock-tracked)",
      daysAgo: 5,
      tier: "reported",
      status: "saved",
    },
    {
      kind: "sale",
      qty: null,
      amt: 850_000,
      desc: "Cold drink sales for the month (aggregated — not stock-tracked)",
      daysAgo: 3,
      tier: "reported",
      status: "saved",
    },
    {
      kind: "expense",
      qty: null,
      amt: 85000,
      desc: "Transport to Makro",
      daysAgo: 20,
      tier: "document_supported",
      status: "saved",
    },
    {
      kind: "expense",
      qty: null,
      amt: 150000,
      desc: "Generator petrol",
      daysAgo: 12,
      tier: "reported",
      status: "saved",
    },
    {
      kind: "stock_count",
      qty: 30,
      amt: 0,
      desc: "Month-end physical stock count — Airtime vouchers",
      daysAgo: 0,
      tier: "document_supported",
      status: "reconciled",
    },
  ];

  let head: { seq: number; canonical_hash: string } | null = null;

  for (const row of rows) {
    const id = uuid();
    const sealed = sealRecord(head, {
      id,
      business_id: bizId,
      kind: row.kind,
      amount_cents: row.amt,
      quantity: row.qty,
      description: row.desc,
      occurred_at: now - row.daysAgo * DAY,
      source_channel: "demo",
      status: row.status,
      evidence_tier: row.tier,
    });

    await db().execute({
      sql: `INSERT INTO records (
        id, business_id, seq, kind, amount_cents, quantity, description, occurred_at,
        source_channel, status, idempotency_key, evidence_tier,
        prev_hash, canonical_hash, signature, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        bizId,
        sealed.seq,
        sealed.kind,
        sealed.amount_cents,
        sealed.quantity,
        sealed.description,
        sealed.occurred_at,
        sealed.source_channel,
        sealed.status,
        null,
        sealed.evidence_tier,
        sealed.prev_hash,
        sealed.canonical_hash,
        sealed.signature,
        userId,
        now,
      ],
    });

    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
  }

  // ─── 5. Verify the seed actually works ──────────────────
  const recRes = await db().execute({
    sql: "SELECT * FROM records WHERE business_id = ? ORDER BY seq ASC",
    args: [bizId],
  });
  const records = recRes.rows.map((r: any) => ({
    id: r.id,
    business_id: r.business_id,
    seq: Number(r.seq),
    kind: r.kind,
    amount_cents: Number(r.amount_cents),
    quantity: r.quantity != null ? Number(r.quantity) : null,
    description: r.description,
    occurred_at: Number(r.occurred_at),
    source_channel: r.source_channel,
    status: r.status,
    evidence_tier: r.evidence_tier,
    prev_hash: r.prev_hash,
    canonical_hash: r.canonical_hash,
    signature: r.signature,
  })) as LedgerRecord[];

  const stock = reconcileStock(records);
  const chain = verifyChain(records);

  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("  DEMO SEEDED");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Login email:    ${demoEmail}`);
  console.log(`  Password:       ${demoPassword}`);
  console.log(`  User ID:        ${userId}`);
  console.log(`  Business ID:    ${bizId}`);
  console.log(`  Records sealed: ${records.length}`);
  console.log("");
  console.log("  Verification:");
  console.log(`    Chain:        ${chain.ok ? "INTACT" : `BROKEN at #${chain.brokenAtSeq}`}`);
  console.log(`    Expected:     ${stock.expected} units`);
  console.log(`    Counted:      ${stock.counted} units`);
  console.log(`    Variance:     ${stock.variance} units`);
  console.log("═══════════════════════════════════════════════════");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});