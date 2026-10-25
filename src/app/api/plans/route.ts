import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

  const res = await db().execute({
    sql: "SELECT * FROM business_plans WHERE business_id = ? ORDER BY created_at DESC",
    args: [businessId],
  });
  return NextResponse.json(res.rows);
}

export async function POST(req: NextRequest) {
  try {
    const { business_id, type, goal, location, capital_available_cents } = await req.json();
    if (!business_id || !type || !goal) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const id = uuid();
    const now = nowMs();

    await db().execute({
      sql: `INSERT INTO business_plans (id, business_id, type, goal, location, capital_available_cents, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)`,
      args: [id, business_id, type, goal, location || null, capital_available_cents || null, now],
    });

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}