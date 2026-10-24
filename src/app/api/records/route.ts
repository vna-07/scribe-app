import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { sealRecord } from "@/lib/ledger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, kind, amount_cents, description, quantity } = body;

    if (!business_id || !kind || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get the current head of the chain
    const headRes = await db().execute({
      sql: "SELECT seq, canonical_hash FROM records WHERE business_id = ? ORDER BY seq DESC LIMIT 1",
      args: [business_id],
    });
    const head = headRes.rows[0]
      ? { seq: Number(headRes.rows[0].seq), canonical_hash: String(headRes.rows[0].canonical_hash) }
      : null;

    const id = uuid();
    const now = nowMs();
    
    // Seal the record into the ledger
    const sealed = sealRecord(head, {
      id,
      business_id,
      kind,
      amount_cents: amount_cents || 0,
      quantity: quantity || null,
      description,
      occurred_at: now,
      source_channel: "web",
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

    return NextResponse.json({ ok: true, record: sealed });
  } catch (error) {
    console.error("Failed to add record:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}