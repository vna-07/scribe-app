import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const DEMO_BUSINESS_ID = "851ffbcf-8694-4194-8df6-7ed51846dc96";

// Single source of truth for "can this caller touch this business?"
async function authorizeBusiness(businessId: string) {
  // HACKATHON BYPASS: the demo business is public read/write.
  if (businessId === DEMO_BUSINESS_ID) return { ok: true as const };

  const user = await getCurrentUser();
  if (!user) return { ok: false as const, status: 401, error: "Unauthorized" };

  const memberCheck = await db().execute({
    sql: "SELECT 1 FROM business_members WHERE business_id = ? AND user_id = ?",
    args: [businessId, user.id],
  });
  if (memberCheck.rows.length === 0) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }
  return { ok: true as const };
}

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("business_id");
    if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    const auth = await authorizeBusiness(businessId);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const res = await db().execute({
      sql: "SELECT * FROM cases WHERE business_id = ? ORDER BY created_at DESC",
      args: [businessId],
    });

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Cases API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { business_id, title, findings } = await req.json();
    if (!business_id || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const auth = await authorizeBusiness(business_id);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    await db().execute({
      sql: "INSERT INTO cases (id, business_id, title, status, findings, created_at) VALUES (?, ?, ?, 'open', ?, ?)",
      args: [id, business_id, title, findings || "No findings yet.", createdAt],
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Cases POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}