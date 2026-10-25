import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

  const res = await db().execute({
    sql: "SELECT * FROM suppliers WHERE business_id = ? ORDER BY name ASC",
    args: [businessId],
  });
  return NextResponse.json(res.rows);
}

export async function POST(req: NextRequest) {
  try {
    const { business_id, name, contact_name, phone, email } = await req.json();
    if (!business_id || !name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const id = uuid();
    await db().execute({
      sql: `INSERT INTO suppliers (id, business_id, name, contact_name, phone, email, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, business_id, name, contact_name || null, phone || null, email || null, nowMs()],
    });

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}