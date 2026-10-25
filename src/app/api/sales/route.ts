import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { sealRecord } from "@/lib/ledger";

export async function POST(req: NextRequest) {
  try {
    const { business_id, product_id, quantity, total_amount_cents } = await req.json();

    if (!business_id || !product_id || !quantity || !total_amount_cents) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Get the product name for the ledger description
    const prodRes = await db().execute({
      sql: "SELECT name FROM products WHERE id = ?",
      args: [product_id],
    });
    if (prodRes.rows.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const productName = String(prodRes.rows[0].name);

    // 2. Get the current head of the ledger
    const headRes = await db().execute({
      sql: "SELECT seq, canonical_hash FROM records WHERE business_id = ? ORDER BY seq DESC LIMIT 1",
      args: [business_id],
    });
    const head = headRes.rows[0]
      ? { seq: Number(headRes.rows[0].seq), canonical_hash: String(headRes.rows[0].canonical_hash) }
      : null;

    // 3. Seal the sale into the ledger
    const id = uuid();
    const now = nowMs();
    const sealed = sealRecord(head, {
      id,
      business_id,
      kind: "sale",
      amount_cents: total_amount_cents,
      quantity: quantity,
      description: `Sale: ${quantity}x ${productName}`,
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

    // 4. Deduct the stock via the movement ledger
    const moveId = uuid();
    await db().execute({
      sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity_delta, reference_id, notes, created_at) 
            VALUES (?, ?, ?, 'sale', ?, ?, ?, ?)`,
      args: [moveId, business_id, product_id, -Math.abs(quantity), id, `Sale of ${quantity}x ${productName}`, now],
    });

    return NextResponse.json({ ok: true, sale_id: id });
  } catch (error) {
    console.error("Sale error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}