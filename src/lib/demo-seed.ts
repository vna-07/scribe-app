import { db, nowMs, uuid } from "./db";
import { sealRecord } from "./ledger";

const DAY = 86_400_000;

export async function seedRecordsForBusiness(
  bizId: string,
  userId: string
): Promise<number> {
  const now = nowMs();
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
      kind: "stock_purchase", qty: 50, amt: 42500,
      desc: "Opening stock — Airtime voucher R10 (50 units)",
      daysAgo: 30, tier: "document_supported", status: "saved",
    },
    ...Array.from({ length: 12 }, (_, i) => ({
      kind: "sale" as const, qty: 1, amt: 1200,
      desc: `Cash sale — Airtime voucher R10`,
      daysAgo: 27 - i * 2,
      tier: "document_supported" as const, status: "saved" as const,
    })),
    {
      kind: "sale", qty: null, amt: 1_200_000,
      desc: "Bread sales for the month (aggregated — not stock-tracked)",
      daysAgo: 5, tier: "reported", status: "saved",
    },
    {
      kind: "sale", qty: null, amt: 850_000,
      desc: "Cold drink sales for the month (aggregated — not stock-tracked)",
      daysAgo: 3, tier: "reported", status: "saved",
    },
    {
      kind: "expense", qty: null, amt: 85000,
      desc: "Transport to Makro",
      daysAgo: 20, tier: "document_supported", status: "saved",
    },
    {
      kind: "expense", qty: null, amt: 150000,
      desc: "Generator petrol",
      daysAgo: 12, tier: "reported", status: "saved",
    },
    {
      kind: "stock_count", qty: 30, amt: 0,
      desc: "Month-end physical stock count — Airtime vouchers",
      daysAgo: 0, tier: "document_supported", status: "reconciled",
    },
  ];

  let head: { seq: number; canonical_hash: string } | null = null;
  let count = 0;

  for (const row of rows) {
    const id = uuid();
    const sealed = sealRecord(head, {
      id, business_id: bizId, kind: row.kind,
      amount_cents: row.amt, quantity: row.qty, description: row.desc,
      occurred_at: now - row.daysAgo * DAY,
      source_channel: "demo", status: row.status, evidence_tier: row.tier,
    });

    await db().execute({
      sql: `INSERT INTO records (
        id, business_id, seq, kind, amount_cents, quantity, description, occurred_at,
        source_channel, status, idempotency_key, evidence_tier,
        prev_hash, canonical_hash, signature, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, bizId, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity,
        sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status,
        null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash,
        sealed.signature, userId, now,
      ],
    });

    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
    count++;
  }

  return count;
}

export async function loadBusinessRecords(bizId: string) {
  const recRes = await db().execute({
    sql: "SELECT * FROM records WHERE business_id = ? ORDER BY seq ASC",
    args: [bizId],
  });
  return recRes.rows.map((r: any) => ({
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
  }));
}

export async function getBusinessOwner(bizId: string): Promise<string> {
  const res = await db().execute({
    sql: `SELECT bm.user_id FROM business_members bm
          JOIN users u ON u.id = bm.user_id
          WHERE bm.business_id = ? AND u.is_demo = 1
          LIMIT 1`,
    args: [bizId],
  });
  if (res.rows.length === 0) throw new Error("No demo owner found");
  return String(res.rows[0].user_id);
}