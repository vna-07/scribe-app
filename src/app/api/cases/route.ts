import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessId = req.nextUrl.searchParams.get("business_id");
    if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    // Direct membership check
    const memberCheck = await db().execute({
      sql: "SELECT 1 FROM business_members WHERE business_id = ? AND user_id = ?",
      args: [businessId, user.id],
    });

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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