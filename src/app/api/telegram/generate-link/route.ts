import { NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { randomInt } from "crypto"; // <-- THIS FIXES THE TS ERROR

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const code = randomInt(100000, 1000000).toString(); // 6 digit code
    const expiresAt = nowMs() + 15 * 60 * 1000; // 15 mins

    // Clear old unlinked codes for this user
    await db().execute({
      sql: "DELETE FROM telegram_links WHERE user_id = ? AND telegram_chat_id IS NULL",
      args: [user.id],
    });

    // Insert new code
    await db().execute({
      sql: "INSERT INTO telegram_links (id, user_id, linking_code, expires_at) VALUES (?, ?, ?, ?)",
      args: [uuid(), user.id, code, expiresAt],
    });

    return NextResponse.json({ code, expiresAt });
  } catch (error) {
    console.error("Telegram Link Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}