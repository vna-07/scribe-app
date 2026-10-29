import { NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { randomInt } from "crypto";

export async function POST() {
  try {
    let userId = (await getCurrentUser())?.id;
    
    // HACKATHON BYPASS: If no session, fallback to the demo user
    // This ensures judges can always generate a Telegram code on preview URLs.
    if (!userId) {
      const demoRes = await db().execute({
        sql: "SELECT id FROM users WHERE email = 'demo@scribe.co.za' LIMIT 1"
      });
      if (demoRes.rows.length > 0) {
        userId = String(demoRes.rows[0].id);
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const code = randomInt(100000, 1000000).toString(); 
    const expiresAt = nowMs() + 15 * 60 * 1000; 

    // Clear old unlinked codes for this user
    await db().execute({
      sql: "DELETE FROM telegram_links WHERE user_id = ? AND telegram_chat_id IS NULL",
      args: [userId],
    });

    // Insert new code
    await db().execute({
      sql: "INSERT INTO telegram_links (id, user_id, linking_code, expires_at) VALUES (?, ?, ?, ?)",
      args: [uuid(), userId, code, expiresAt],
    });

    return NextResponse.json({ code, expiresAt });
  } catch (error) {
    console.error("Telegram Link Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}