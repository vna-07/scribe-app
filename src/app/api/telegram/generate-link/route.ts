import { NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  const expiresAt = nowMs() + 15 * 60 * 1000; // 15 mins

  // Clear old codes for this user
  await db().execute({
    sql: "DELETE FROM telegram_links WHERE user_id = ? AND telegram_chat_id IS NULL",
    args: [user.id],
  });

  await db().execute({
    sql: "INSERT INTO telegram_links (id, user_id, linking_code, expires_at) VALUES (?, ?, ?, ?)",
    args: [uuid(), user.id, code, expiresAt],
  });

  return NextResponse.json({ code });
}