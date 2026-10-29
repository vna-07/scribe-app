import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("business_id");
    if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    // HACKATHON BYPASS: Allow access to the demo business without a session
    const isDemo = businessId === "851ffbcf-8694-4194-8df6-7ed51846dc96";

    if (!isDemo) {
      const user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const memberCheck = await db().execute({
        sql: "SELECT 1 FROM business_members WHERE business_id = ? AND user_id = ?",
        args: [businessId, user.id],
      });

      if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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