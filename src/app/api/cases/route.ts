import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { authorizeBusiness } from "@/lib/guard";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

  const { error } = await authorizeBusiness(businessId);
  if (error) return error;

  const res = await db().execute({
    sql: "SELECT * FROM cases WHERE business_id = ? ORDER BY created_at DESC",
    args: [businessId],
  });

  return NextResponse.json(res.rows);
}

export async function POST(req: NextRequest) {
  try {
    const { business_id, title } = await req.json();
    const { error } = await authorizeBusiness(business_id);
    if (error) return error;

    const id = uuid();
    await db().execute({
      sql: "INSERT INTO cases (id, business_id, title, status, created_at) VALUES (?, ?, ?, 'open', ?)",
      args: [id, business_id, title, nowMs()],
    });

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}