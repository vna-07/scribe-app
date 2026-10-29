import { NextRequest, NextResponse } from "next/server";
import { db, nowMs } from "@/lib/db";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;
const WEB_URL = "https://scribe-app-xi.vercel.app";

async function sendMessage(chatId: string, text: string, replyMarkup?: any) {
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: replyMarkup,
    }),
  });
  if (!res.ok) {
    console.error("sendMessage failed:", res.status, await res.text());
  }
}

async function answerCallback(callbackQueryId: string) {
  await fetch(`${API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

function escapeMd(s: string) {
  return s.replace(/[_*`\[\]]/g, "\\$&");
}

// ─── Natural-language transaction parser ────────────────────────
type TxType = "sale" | "expense";

function extractType(text: string): TxType | null {
  const lower = text.toLowerCase();
  if (/\b(sold|sale|income|received|earned|made)\b/.test(lower)) return "sale";
  if (/\b(bought|buy|spent|paid|expense|purchased|lost)\b/.test(lower)) return "expense";
  return null;
}

function extractAmount(text: string): number | null {
  // 1. R-prefixed amount wins ("R45", "R 45.50", "R45,50")
  const rMatch = text.match(/\bR\s?(\d+(?:[.,]\d{1,2})?)/i);
  if (rMatch) return parseFloat(rMatch[1].replace(",", "."));

  // 2. "for 45" / "for R45"
  const forMatch = text.match(/\bfor\s+(?:R\s?)?(\d+(?:[.,]\d{1,2})?)/i);
  if (forMatch) return parseFloat(forMatch[1].replace(",", "."));

  // 3. Bare amount with a decimal ("spent 45.50 on X")
  const decimalMatch = text.match(/\b(\d+[.,]\d{1,2})\b/);
  if (decimalMatch) return parseFloat(decimalMatch[1].replace(",", "."));

  // No safe fallback — quantity ≠ amount. Ask the user.
  return null;
}

const mainMenu = {
  inline_keyboard: [
    [{ text: "📄 Check a document", callback_data: "check_doc" }, { text: "💬 Check a message", callback_data: "check_msg" }],
    [{ text: "💰 Record a transaction", callback_data: "record_tx" }, { text: "📊 Business insights", callback_data: "insights" }],
    [{ text: "🔍 My investigations", callback_data: "cases" }, { text: "🤖 Ask Themba", callback_data: "themba" }],
    [{ text: "🔌 Explore Integrations", callback_data: "integrations" }],
    [{ text: "🚀 Open SCRIBE Workspace", url: WEB_URL }],
    [{ text: "🎭 Enter Demo Mode", callback_data: "demo_mode" }],
  ],
};

async function resolveLinkedUser(chatId: string): Promise<string | null> {
  const r = await db().execute({
    sql: "SELECT user_id FROM telegram_links WHERE telegram_chat_id = ?",
    args: [chatId],
  });
  return r.rows.length > 0 ? String(r.rows[0].user_id) : null;
}

async function resolveBusinessId(userId: string): Promise<string | null> {
  const r = await db().execute({
    sql: "SELECT business_id FROM business_members WHERE user_id = ? LIMIT 1",
    args: [userId],
  });
  return r.rows.length > 0 ? String(r.rows[0].business_id) : null;
}

async function casesTextForUser(userId: string): Promise<string> {
  const bizId = await resolveBusinessId(userId);
  if (!bizId) {
    return "No business found. Please set one up on the web app.";
  }
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
  return reply;
}

const NEED_LINK =
  "⚠️ Please link your account first.\n\nGenerate a code in *Settings > Telegram* on the web app, then send:\n`/link YOUR_CODE`";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── 1. Callback button clicks ────────────────────────────────
    if (body.callback_query) {
      const { id, data, message } = body.callback_query;
      const chatId = String(message.chat.id);
      await answerCallback(id);

      switch (data) {
        case "demo_mode":
          await sendMessage(
            chatId,
            "🎭 *Demo Mode Activated*\n\n" +
              "You can explore the full SCRIBE workspace using our demo data.\n\n" +
              `🔗 *Web App:* ${WEB_URL}\n` +
              "📧 *Email:* demo@scribe.co.za\n" +
              "🔑 *Password:* DemoTrader2026!",
          );
          break;

        case "check_doc":
          await sendMessage(
            chatId,
            "📄 *Document Check*\n\nPlease upload a photo of a receipt, invoice, or statement. I will extract the details and explain any inconsistencies for you to review.",
          );
          break;

        case "check_msg":
          await sendMessage(
            chatId,
            "💬 *Message Check*\n\nPaste a suspicious SMS, WhatsApp, or email below. I will highlight warning signs like urgent language, PIN requests, or suspicious links.",
          );
          break;

        case "cases": {
          const userId = await resolveLinkedUser(chatId);
          if (!userId) {
            await sendMessage(chatId, NEED_LINK);
          } else {
            await sendMessage(chatId, await casesTextForUser(userId));
          }
          break;
        }

        case "record_tx":
          await sendMessage(
            chatId,
            "💰 *Record a Transaction*\n\n" +
              "Type it naturally and I'll save it to your ledger:\n" +
              `• \`Sold 3 bread for R45\`\n` +
              `• \`Paid R120 for fuel\`\n` +
              `• \`Bought stock for R500\``,
          );
          break;

        case "insights":
          await sendMessage(
            chatId,
            `📊 *Business Insights*\n\nOpen the SCRIBE workspace to see your daily cash flow, stock variances, and readiness score:\n${WEB_URL}\n\nComing soon: a one-tap summary right here in Telegram.`,
          );
          break;

        case "themba":
          await sendMessage(
            chatId,
            "🤖 *Ask Themba*\n\nJust send me your question — e.g.:\n" +
              `"Why did my profit drop last week?"\n` +
              `"What's my best-selling product?"\n\n` +
              "(Themba's natural-language answers land in the next update.)",
          );
          break;

        case "integrations":
          await sendMessage(
            chatId,
            "🔌 *Explore Integrations*\n\n" +
              "We are building connections for POS systems, bank feeds, and supplier imports.\n\n" +
              `[View the full product roadmap](${WEB_URL}) in the web app.`,
          );
          break;

        default:
          await sendMessage(chatId, "Unknown action.", mainMenu);
      }

      return NextResponse.json({ ok: true });
    }

    // ── 2. Text / photo messages ─────────────────────────────────
    const message = body.message || body.edited_message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const text = message.text || "";

    // /start and /menu
    if (text.startsWith("/start") || text === "/menu") {
      await sendMessage(
        chatId,
        "Molo 👋\n\n" +
          "Welcome to *SCRIBE*. I can help you organise business records, check documents, and understand your numbers.\n\n" +
          "What would you like to do today?",
        mainMenu,
      );
      return NextResponse.json({ ok: true });
    }

    // /link CODE
    if (text.startsWith("/link")) {
      const code = text.split(/\s+/)[1];
      if (!code || code === "YOUR_CODE") {
        await sendMessage(
          chatId,
          "Please generate a real code from the SCRIBE web app (Settings > Telegram) and type `/link 123456`.",
        );
        return NextResponse.json({ ok: true });
      }

      const linkRes = await db().execute({
        sql: "SELECT id FROM telegram_links WHERE linking_code = ? AND expires_at > ?",
        args: [code, nowMs()],
      });

      if (linkRes.rows.length === 0) {
        await sendMessage(chatId, "❌ Invalid or expired code. Generate a new one from the web app.");
        return NextResponse.json({ ok: true });
      }

      await db().execute({
        sql: "UPDATE telegram_links SET telegram_chat_id = ?, linking_code = NULL, expires_at = NULL, linked_at = ? WHERE id = ?",
        args: [chatId, nowMs(), String(linkRes.rows[0].id)],
      });

      await sendMessage(
        chatId,
        "✅ *Account Linked!*\n\nYou can now send documents or ask Themba questions directly here.",
        mainMenu,
      );
      return NextResponse.json({ ok: true });
    }

    // /cases
    const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();
    if (command === "/cases") {
      const userId = await resolveLinkedUser(chatId);
      if (!userId) {
        await sendMessage(chatId, NEED_LINK);
      } else {
        await sendMessage(chatId, await casesTextForUser(userId));
      }
      return NextResponse.json({ ok: true });
    }

    // Photo (receipt) — unchanged
    if (message.photo) {
      const userId = await resolveLinkedUser(chatId);
      if (!userId) {
        await sendMessage(chatId, NEED_LINK);
        return NextResponse.json({ ok: true });
      }

      await sendMessage(
        chatId,
        "📸 *Receipt received.*\n\nDocument extraction is coming in the next update — for now the receipt isn't stored.",
      );
      return NextResponse.json({ ok: true });
    }

    // ── 3. Free text → try to record a transaction ───────────────
    const userId = await resolveLinkedUser(chatId);

    if (!userId) {
      // Unknown slash command, or unlinked user typing random text
      await sendMessage(chatId, "I didn't quite catch that. Here is the main menu:", mainMenu);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/")) {
      // Unrecognised command (e.g. /help). Don't try to record it.
      await sendMessage(chatId, "I didn't quite catch that. Here is the main menu:", mainMenu);
      return NextResponse.json({ ok: true });
    }

    const type = extractType(text);
    const amount = extractAmount(text);

    if (type === null || amount === null || amount <= 0) {
      await sendMessage(
        chatId,
        "💰 *Record a Transaction*\n\n" +
          "I couldn't pick out the details from that message. Try one of these:\n" +
          `• \`Sold 3 bread for R45\`\n` +
          `• \`Paid R120 for fuel\`\n` +
          `• \`Bought stock for R500\``,
      );
      return NextResponse.json({ ok: true });
    }

    const bizId = await resolveBusinessId(userId);
    if (!bizId) {
      await sendMessage(
        chatId,
        "⚠️ No business linked to your account yet. Set one up on the web app first.",
      );
      return NextResponse.json({ ok: true });
    }

    const recordId = crypto.randomUUID();
    const amountCents = Math.round(amount * 100);

    try {
      await db().execute({
        sql:
          "INSERT INTO records (id, business_id, occurred_at, description, amount_cents, type, evidence_tier) " +
          "VALUES (?, ?, ?, ?, ?, ?, 'self_declared')",
        args: [recordId, bizId, nowMs(), text, amountCents, type],
      });
    } catch (dbErr) {
      console.error("Telegram record insert failed:", dbErr, { bizId, type, amountCents });
      await sendMessage(
        chatId,
        "⚠️ I couldn't save that to your ledger right now. Please try the *Record Sale* / *Record Expense* buttons on the web app.",
      );
      return NextResponse.json({ ok: true });
    }

    await sendMessage(
      chatId,
      `✅ *Recorded!*\n\n` +
        `📝 *${type === "sale" ? "Sale" : "Expense"}*\n` +
        `💰 Amount: *R${amount.toFixed(2)}*\n` +
        `📄 _${escapeMd(text)}_\n\n` +
        "Saved to your ledger. Open the web app to see it in your records.",
      mainMenu,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}