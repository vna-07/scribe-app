import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { sealRecord } from "@/lib/ledger";
import { authorizeBusiness } from "@/lib/guard";
import { z } from "zod";

const Body = z.object({
  business_id: z.string(),
  kind: z.enum(["sale", "expense", "stock_purchase", "stock_count", "loss"]),
  amount_cents: z.number().int().nonnegative(),
  quantity: z.number().int().nullable().optional(),
  description: z.string().min(1).max(255),
  occurred_at: z.number().int(),
  source_channel: z.enum(["web", "telegram", "whatsapp", "csv", "demo"]).default("web"),
  evidence_tier: z.enum(["reported", "document_supported", "counter_signed"]).default("reported"),
});

export async function POST(req: NextRequest) {
  try {
    const idemKey = req.headers.get("idempotency-key");
    const json = await req.json();
    
    // 1. Validate the schema
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }
    const body = parsed.data;

    // 2. HARDENING: Ensure the user actually has access to this business
    const { error } = await authorizeBusiness(body.business_id);
    if (error) return error;

    // 3. Check for duplicate submissions
    if (idemKey) {
      const existing = await db().execute({
        sql: "SELECT * FROM records WHERE business_id = ? AND idempotency_key = ? LIMIT 1",
        args: [body.business_id, idemKey],
      });
      if (existing.rows.length > 0) {
        return NextResponse.json(existing.rows[0], { status: 200 });
      }
    }

    // 4. Get the current head of the chain
    const headRes = await db().execute({
      sql: "SELECT seq, canonical_hash FROM records WHERE business_id = ? ORDER BY seq DESC LIMIT 1",
      args: [body.business_id],
    });
    const head = headRes.rows[0]
      ? { seq: Number(headRes.rows[0].seq), canonical_hash: String(headRes.rows[0].canonical_hash) }
      : null;

    // 5. Seal the record
    const id = uuid();
    const sealed = sealRecord(head, {
      id,
      business_id: body.business_id,
      kind: body.kind,
      amount_cents: body.amount_cents,
      quantity: body.quantity ?? null,
      description: body.description,
      occurred_at: body.occurred_at,
      source_channel: body.source_channel,
      status: "saved",
      evidence_tier: body.evidence_tier,
    });

    // 6. Insert into the database
    await db().execute({
      sql: `INSERT INTO records (
        id, business_id, seq, kind, amount_cents, quantity, description, occurred_at,
        source_channel, status, idempotency_key, evidence_tier,
        prev_hash, canonical_hash, signature, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, body.business_id, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity,
        sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status,
        idemKey || null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash,
        sealed.signature, null, nowMs(),
      ],
    });

    return NextResponse.json({ ...sealed }, { status: 201 });
  } catch (err: any) {
    console.error("[records POST] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}