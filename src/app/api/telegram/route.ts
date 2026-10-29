import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(chatId: string, text: string, replyMarkup?: any) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", reply_markup: replyMarkup }),
  });
}

// Escape user-controlled text so it can't break the Markdown parse.
// (Titles come from the web app, so a user could set one to "Q3 *leak*" and
// otherwise Telegram would reject the whole sendMessage with 400.)
function escapeMd(s: string) {
  return s.replace(/[_*`\[\]]/g, "\\$&");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.edited_message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const text = message.text || "";

    // 1. Handle /start
    if (text.startsWith("/start")) {
      const welcome =
        `👋 *Welcome to SCRIBE*\n\n` +
        `I'm here to help you organise business records, check suspicious documents, and understand your business activity.\n\n` +
        `To connect your existing SCRIBE account, type:\n` +
        `\`/link YOUR_CODE\`\n\n` +
        `(Get your code from the SCRIBE web app under Settings > Telegram)`;

      await sendMessage(chatId, welcome);
      return NextResponse.json({ ok: true, action: "start" });
    }

    // 2. Handle /link CODE
    if (text.startsWith("/link")) {
      const code = text.split(" ")[1];
      if (!code) {
        await sendMessage(chatId, "Please provide the linking code. Example: `/link 123456`");
        return NextResponse.json({ ok: true });
      }

      // Find valid, unexpired code
      const linkRes = await db().execute({
        sql: "SELECT id, user_id FROM telegram_links WHERE linking_code = ? AND expires_at > ?",
        args: [code, nowMs()],
      });

      if (linkRes.rows.length === 0) {
        await sendMessage(chatId, "❌ Invalid or expired linking code. Please generate a new one from the web app.");
        return NextResponse.json({ ok: true });
      }

      // Success! Link the account.
      const linkId = String(linkRes.rows[0].id);
      await db().execute({
        sql: "UPDATE telegram_links SET telegram_chat_id = ?, linking_code = NULL, linked_at = ? WHERE id = ?",
        args: [chatId, nowMs(), linkId],
      });

      await sendMessage(chatId, "✅ *Account Linked Successfully!*\n\nYou can now send me a photo of a receipt, or type a transaction. To view your dashboard, visit: https://scribe-app-xi.vercel.app/dashboard");
      return NextResponse.json({ ok: true });
    }

    // 3. Check if user is linked for all other actions
    const sessionRes = await db().execute({
      sql: "SELECT user_id FROM telegram_links WHERE telegram_chat_id = ?",
      args: [chatId],
    });

    if (sessionRes.rows.length === 0) {
      await sendMessage(chatId, "⚠️ Your account is not linked. Please type `/link YOUR_CODE` to connect.");
      return NextResponse.json({ ok: true });
    }

    const userId = String(sessionRes.rows[0].user_id);

    // 4. Handle receiving a Photo (Receipt)
    if (message.photo) {
      // Get the highest resolution photo
      const photo = message.photo[message.photo.length - 1];

      await sendMessage(chatId, "📸 *Receipt received.* Processing your document... (This feature is in Phase 2: Document Intelligence)");

      // NOTE: To actually download, you call getFile, then download the file via https://api.telegram.org/file/bot<token>/<file_path>
      // We will build the processing pipeline in the next step.

      return NextResponse.json({ ok: true });
    }

    // 5. Handle /cases command (with optional @BotName suffix in groups)
    const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();
    if (command === "/cases") {
      // Find user's business
      const bizRes = await db().execute({
        sql: "SELECT business_id FROM business_members WHERE user_id = ? LIMIT 1",
        args: [userId],
      });
      if (bizRes.rows.length === 0) {
        await sendMessage(chatId, "No business found. Please set one up on the web app.");
        return NextResponse.json({ ok: true });
      }

      const bizId = String(bizRes.rows[0].business_id);
      const casesRes = await db().execute({
        sql: "SELECT title, status FROM cases WHERE business_id = ? ORDER BY created_at DESC LIMIT 5",
        args: [bizId],
      });

      let reply = "📂 *Your Recent Cases:*\n\n";
      if (casesRes.rows.length === 0) {
        reply += "No cases yet. Send me a receipt to start one.";
      } else {
        for (const row of casesRes.rows) {
          reply += `• ${escapeMd(String(row.title))} — *${escapeMd(String(row.status))}*\n`;
        }
      }

      await sendMessage(chatId, reply);
      return NextResponse.json({ ok: true });
    }

    // 6. Handle normal text (e.g., "I sold bread for 20 rand")
    if (text) {
      await sendMessage(chatId, `🤖 *Themba:* I received your message: "${escapeMd(text)}"\n\n(To use the full AI assistant, open the web app or ask me a question here once Phase 2 is live).`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}