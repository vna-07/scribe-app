import { NextRequest, NextResponse } from "next/server";
import { askThemba } from "@/lib/themba";
import { loadBusinessRecords } from "@/lib/demo-seed";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { business_id, question } = await req.json();
  if (!business_id || typeof question !== "string") {
    return NextResponse.json({ error: "business_id and question required" }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json({ error: "question too long" }, { status: 400 });
  }

  const bizRes = await db().execute({
    sql: "SELECT name FROM businesses WHERE id = ?",
    args: [business_id],
  });
  if (bizRes.rows.length === 0) {
    return NextResponse.json({ error: "business not found" }, { status: 404 });
  }

  const records = await loadBusinessRecords(business_id);
  const answer = await askThemba({
    question,
    records,
    businessName: String(bizRes.rows[0].name),
  });

  return NextResponse.json(answer);
}