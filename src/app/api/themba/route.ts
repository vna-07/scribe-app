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
  "cases",
] as const;
type ActiveTab = (typeof SUPPORTED_TABS)[number];

const SUPPORTED_MODES = ["bi", "growth", "assistant"] as const;
type Mode = (typeof SUPPORTED_MODES)[number];

export async function POST(req: NextRequest) {
  try {
    const {
      business_id,
      question,
      history = [],
      locale = "en",
      active_tab = "overview",
      mode = "bi",
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
    const safeMode: Mode = SUPPORTED_MODES.includes(mode) ? mode : "bi";

    const records = await loadBusinessRecords(business_id);
    const answer = await askThemba({
      question,
      records,
      businessName: String(bizRes.rows[0].name),
      history: Array.isArray(history) ? (history as ConversationTurn[]) : [],
      locale: safeLocale,
      active_tab: safeTab,
      mode: safeMode,
    });

    return NextResponse.json(answer);
  } catch (err) {
    console.error("Themba API error:", err);
    return NextResponse.json(
      { error: "Themba is unavailable. Please try again." },
      { status: 500 },
    );
  }
}