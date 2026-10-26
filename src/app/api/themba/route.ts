import { NextRequest, NextResponse } from "next/server";
import { askThemba } from "@/lib/themba";
import { loadBusinessRecords } from "@/lib/demo-seed";
import { db } from "@/lib/db";
import type { ConversationTurn } from "@/lib/themba-context";

const SUPPORTED_LOCALES = ["en", "xh", "zu", "af"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const SUPPORTED_TABS = [
  "overview",
  "records",
  "stock",
  "suppliers",
  "intelligence",
  "tasks",
  "opportunities",
  "reports",
] as const;
type ActiveTab = (typeof SUPPORTED_TABS)[number];

export async function POST(req: NextRequest) {
  const {
    business_id,
    question,
    history = [],
    locale = "en",
    active_tab = "overview",
  } = await req.json();

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

  const safeLocale: Locale = SUPPORTED_LOCALES.includes(locale) ? locale : "en";
  const safeTab: ActiveTab = SUPPORTED_TABS.includes(active_tab) ? active_tab : "overview";

  const records = await loadBusinessRecords(business_id);
  const answer = await askThemba({
    question,
    records,
    businessName: String(bizRes.rows[0].name),
    history: Array.isArray(history) ? (history as ConversationTurn[]) : [],
    locale: safeLocale,
    active_tab: safeTab,
  });

  return NextResponse.json(answer);
}