import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertDemoBusiness } from "@/lib/demo-guard";
import { seedRecordsForBusiness, getBusinessOwner } from "@/lib/demo-seed";

export async function POST(req: NextRequest) {
  const { business_id } = await req.json();
  if (!business_id) return NextResponse.json({ error: "business_id required" }, { status: 400 });

  try {
    await assertDemoBusiness(business_id);
  } catch (e: any) {
    return NextResponse.json({ error: "Forbidden" }, { status: e.status ?? 403 });
  }

  const ownerId = await getBusinessOwner(business_id);

  // Wipe all records for this business (only demo business — guarded above)
  await db().execute({
    sql: "DELETE FROM records WHERE business_id = ?",
    args: [business_id],
  });

  const count = await seedRecordsForBusiness(business_id, ownerId);
  return NextResponse.json({ ok: true, count });
}