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

// ─── News context (RSS — no API key, works on Vercel) ─────────
const NEWS_FEED_URL = "https://businesstech.co.za/news/feed/";
const NEWS_TTL_MS = 15 * 60 * 1000;

let newsCache: { at: number; items: string[] } | null = null;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function parseRssTitles(xml: string): string[] {
  const titles: string[] = [];
  // Match <item>…</item> blocks, then the <title> inside each.
  // Feeds sometimes wrap titles in CDATA, so we handle both forms.
  const re = /<item\b[^>]*>[\s\S]*?<title>([\s\S]*?)<\/title>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    let t = m[1];
    t = t.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "");
    t = decodeEntities(t);
    // Drop trailing " | BusinessTech" / " - BusinessTech" if present
    t = t.replace(/\s+[|–-]\s+BusinessTech\s*$/i, "");
    t = t.replace(/\s+/g, " ").trim();
    if (t.length > 0 && t.length < 200) titles.push(t);
  }
  return titles;
}

function formatHeadlines(items: string[]): string {
  if (items.length === 0) return "";
  return items.map((t, i) => `${i + 1}. ${t}`).join("\n");
}

async function fetchNewsHeadlines(): Promise<string> {
  const now = Date.now();
  if (newsCache && now - newsCache.at < NEWS_TTL_MS) {
    return formatHeadlines(newsCache.items);
  }

  try {
    const res = await fetch(NEWS_FEED_URL, {
      headers: {
        "user-agent": "SCRIBE-Bot/1.0 (+https://scribe-app-xi.vercel.app)",
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn("[Themba] RSS fetch failed:", res.status);
      return "";
    }
    const xml = await res.text();
    const items = parseRssTitles(xml).slice(0, 5);
    newsCache = { at: now, items };
    return formatHeadlines(items);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[Themba] RSS fetch exception:", msg);
    return "";
  }
}

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

    const [records, newsContext] = await Promise.all([
      loadBusinessRecords(business_id),
      fetchNewsHeadlines(),
    ]);

    const answer = await askThemba({
      question,
      records,
      businessName: String(bizRes.rows[0].name),
      history: Array.isArray(history) ? (history as ConversationTurn[]) : [],
      locale: safeLocale,
      active_tab: safeTab,
      mode: safeMode,
      news_context: newsContext,
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