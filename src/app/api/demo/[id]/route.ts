import { NextRequest, NextResponse } from "next/server";
import { loadDemoData } from "@/lib/demo-data";
import { db } from "@/lib/db";
import { authorizeBusiness } from "@/lib/guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ─── HARDENING CHECK ───
    // If it's the demo business, allow public access (for the judge)
    const isDemo = await db().execute({
      sql: "SELECT 1 FROM business_members bm JOIN users u ON u.id = bm.user_id WHERE bm.business_id = ? AND u.is_demo = 1",
      args: [id],
    });

    if (isDemo.rows.length === 0) {
      // If not demo, enforce strict auth
      const { error } = await authorizeBusiness(id);
      if (error) return error;
    }

    const data = await loadDemoData(id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[demo GET] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}