import { NextRequest, NextResponse } from "next/server";
import { verifyChain } from "@/lib/ledger";
import { loadBusinessRecords } from "@/lib/demo-seed";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  const records = await loadBusinessRecords(businessId);
  const result = verifyChain(records);
  return NextResponse.json(result);
}