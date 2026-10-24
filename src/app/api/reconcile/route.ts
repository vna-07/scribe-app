import { NextRequest, NextResponse } from "next/server";
import { reconcileStock, revenueRange } from "@/lib/reconcile";
import { consistencyScore } from "@/lib/score";
import { loadBusinessRecords } from "@/lib/demo-seed";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  const records = await loadBusinessRecords(businessId);
  return NextResponse.json({
    stock: reconcileStock(records),
    revenue: revenueRange(records),
    score: consistencyScore(records),
  });
}