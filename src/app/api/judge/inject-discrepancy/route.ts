import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { sealRecord } from "@/lib/ledger";
import { assertDemoBusiness } from "@/lib/demo-guard";

export async function POST(req: NextRequest) {
  const { business_id } = await req.json();
  if (!business_id) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  try {
    await assertDemoBusiness(business_id);
  } catch (e: any) {
    return NextResponse.json({ error: "Forbidden" }, { status: e.status ?? 403 });
  }

  const headRes = await db().execute({
    sql: "SELECT seq, canonical_hash FROM records WHERE business_id = ? ORDER BY seq DESC LIMIT 1",
    args: [business_id],
  });
  const head = headRes.rows[0]
    ? { seq: Number(headRes.rows[0].seq), canonical_hash: String(headRes.rows[0].canonical_hash) }
    : null;

  const id = uuid();
  const now = nowMs();
  const sealed = sealRecord(head, {
    id,
    business_id,
    kind: "loss",
    amount_cents: 0,
    quantity: 3,
    description: "Suspected breakage — 3 units (Judge Mode injection)",
    occurred_at: now,
    source_channel: "demo",
    status: "saved",
    evidence_tier: "reported",
  });

  await db().execute({
    sql: `INSERT INTO records (
      id, business_id, seq, kind, amount_cents, quantity, description, occurred_at,
      source_channel, status, idempotency_key, evidence_tier,
      prev_hash, canonical_hash, signature, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, business_id, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity,
      sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status,
      null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash,
      sealed.signature, null, now,
    ],
  });

  return NextResponse.json({ ok: true, record_seq: sealed.seq });
}