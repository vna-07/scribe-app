import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { getCurrentUser, getUserBusinesses } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauth" }, { status: 401 });
  const businesses = await getUserBusinesses(user.id);
  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauth" }, { status: 401 });

  const body = await req.json();
  const {
    name, business_type, location, currency,
    description, onboarding_path, business_stage,
    registration_status, vat_status, main_goal,
  } = body;

  if (!name || !business_type || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const bizId = uuid();
  const now = nowMs();

  await db().execute({
    sql: `INSERT INTO businesses (
      id, name, business_type, location, currency, trading_since, operating_notes, created_at,
      onboarding_path, business_stage, registration_status, vat_status, main_goal, business_description
    ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      bizId, name, business_type, location, currency || "ZAR", now,
      onboarding_path || null,
      business_stage || null,
      registration_status || null,
      vat_status || null,
      main_goal || null,
      description || null,
    ],
  });
  await db().execute({
    sql: `INSERT INTO business_members (business_id, user_id, role) VALUES (?, ?, 'owner')`,
    args: [bizId, user.id],
  });

  return NextResponse.json({ id: bizId });
}