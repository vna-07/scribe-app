import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  const res = await db().execute({
    sql: "SELECT * FROM tasks WHERE business_id = ? ORDER BY created_at DESC",
    args: [businessId],
  });
  
  return NextResponse.json(res.rows);
}

export async function POST(req: NextRequest) {
  try {
    const { business_id, title, description } = await req.json();
    if (!business_id || !title) {
      return NextResponse.json({ error: "business_id and title required" }, { status: 400 });
    }

    const id = uuid();
    await db().execute({
      sql: "INSERT INTO tasks (id, business_id, title, description, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)",
      args: [id, business_id, title, description || "", nowMs()],
    });

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}