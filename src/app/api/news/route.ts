import { NextResponse } from "next/server";

const FEED_URL = "https://businesstech.co.za/news/feed/";
const TTL_MS = 15 * 60 * 1000;

type Article = { title: string; url: string; source: { name: string } };

let cache: { at: number; items: Article[] } | null = null;

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

function parseItems(xml: string): Article[] {
  const items: Article[] = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null && items.length < 5) {
    const block = m[1];
    const titleRaw = block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "";
    let title = titleRaw.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "");
    title = decodeEntities(title).replace(/\s+[|–-]\s+BusinessTech\s*$/i, "").replace(/\s+/g, " ").trim();
    if (!title || title.length > 200) continue;
    items.push({
      title,
      url: decodeEntities(link.trim()),
      source: { name: "BusinessTech" },
    });
  }
  return items;
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return NextResponse.json({ articles: cache.items });
  }

  try {
    const res = await fetch(FEED_URL, {
      headers: {
        "user-agent": "SCRIBE-Bot/1.0 (+https://scribe-app-xi.vercel.app)",
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn("[news] RSS fetch failed:", res.status);
      return NextResponse.json({ articles: [] });
    }
    const xml = await res.text();
    const items = parseItems(xml);
    cache = { at: now, items };
    return NextResponse.json({ articles: items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[news] RSS fetch exception:", msg);
    return NextResponse.json({ articles: [] });
  }
}