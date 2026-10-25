import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { sealRecord } from "@/lib/ledger";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Allow demo users to import even if they don't have a session
    // (Since the demo dashboard doesn't require login, we need this fallback)
    if (!user) {
      const { business_id } = await req.json();
      
      // Verify this is a demo business before allowing import
      const demoCheck = await db().execute({
        sql: `SELECT 1 FROM business_members bm 
              JOIN users u ON u.id = bm.user_id 
              WHERE bm.business_id = ? AND u.is_demo = 1 LIMIT 1`,
        args: [business_id],
      });
      
      if (demoCheck.rows.length === 0) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Parse the body again (since we might have consumed it above)
    const body = await req.json();
    const { business_id, records } = body;

    if (!business_id || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "Missing business_id or records" }, { status: 400 });
    }

    const headRes = await db().execute({
      sql: "SELECT seq, canonical_hash FROM records WHERE business_id = ? ORDER BY seq DESC LIMIT 1",
      args: [business_id],
    });
    
    let head = headRes.rows[0]
      ? { seq: Number(headRes.rows[0].seq), canonical_hash: String(headRes.rows[0].canonical_hash) }
      : null;

    let importedCount = 0;
    const now = nowMs();

    for (const row of records) {
      const id = uuid();
      
      const sealed = sealRecord(head, {
        id,
        business_id,
        kind: row.kind || "sale",
        amount_cents: Math.round(Number(row.amount) * 100),
        quantity: row.quantity ? Number(row.quantity) : null,
        description: row.description,
        occurred_at: row.occurred_at || now,
        source_channel: "csv",
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
          sealed.signature, user ? user.id : null, now,
        ],
      });

      head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
      importedCount++;
    }

    return NextResponse.json({ ok: true, count: importedCount });
  } catch (error) {
    console.error("CSV Import failed:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}