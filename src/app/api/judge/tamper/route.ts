import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertDemoBusiness } from "@/lib/demo-guard";

export async function POST(req: NextRequest) {
  const { business_id } = await req.json();
  if (!business_id) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  try {
    await assertDemoBusiness(business_id);
  } catch (e: any) {
    return NextResponse.json({ error: "Forbidden" }, { status: e.status ?? 403 });
  }

  // Tamper with seq 2 (a sale record) — edit amount WITHOUT re-signing.
  // This will break the hash chain when verification runs.
  const pick = await db().execute({
    sql: "SELECT id, seq FROM records WHERE business_id = ? AND seq = 2 LIMIT 1",
    args: [business_id],
  });
  if (pick.rows.length === 0) {
    return NextResponse.json({ error: "seq 2 not found" }, { status: 404 });
  }
  const recordId = String(pick.rows[0].id);
  const seq = Number(pick.rows[0].seq);

  await db().execute({
    sql: "UPDATE records SET amount_cents = amount_cents + 50000 WHERE id = ?",
    args: [recordId],
  });

  // Log this highly sensitive action
  await db().execute({
    sql: "INSERT INTO audit_log (id, actor_id, business_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [crypto.randomUUID(), null, business_id, "LEDGER_TAMPERED", `Record #${seq} modified manually.`, Date.now()],
  });

  return NextResponse.json({ ok: true, tampered_seq: seq });
}