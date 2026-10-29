import type { LedgerRecord } from "./ledger";
import { reconcileStock, revenueRange } from "./reconcile";
import { consistencyScore } from "./score";
import { buildRichContext, type ConversationTurn } from "./themba-context";

export interface ThembaInput {
  question: string;
  records: LedgerRecord[];
  businessName: string;
  history?: ConversationTurn[];
  locale?: "en" | "xh" | "zu" | "af";
  active_tab?: string;
  mode?: "bi" | "growth" | "assistant";
}

export interface ProposedAction {
  type: "create_task" | "draft_message" | "record_stock_count" | "none";
  title: string;
  description: string;
}

export interface ThembaAnswer {
  answer: string;
  proposed_action: ProposedAction | null;
  refused: boolean;
  refusal_reason: string | null;
  provider: "gemini" | "groq" | "fallback";
}

// Tabs that map to tactical / BI-style mode. Anything not here and not in
// GROWTH_TABS falls through to the SCRIBE Guide fallback (used for Settings,
// Admin, and any tab we haven't explicitly classified).
const COMPANION_TABS = ["overview", "records", "stock", "suppliers", "intelligence", "reports", "cases"];
const GROWTH_TABS = ["tasks", "opportunities"];

// Legacy: tab-derived mode (used only as a fallback when the frontend
// doesn't pass an explicit mode — some callers like /api/themba pre-toggle).
function modeForTab(activeTab: string): "companion" | "growth" | "guide" {
  if (GROWTH_TABS.includes(activeTab)) return "growth";
  if (COMPANION_TABS.includes(activeTab)) return "companion";
  return "guide";
}

// Unified internal mode. Frontend "bi" is semantically equivalent to
// tab-derived "companion" — both mean "analytical / tactical". "assistant"
// is a genuinely new mode (drafting help) that has no tab analog.
type InternalMode = "companion" | "growth" | "guide" | "assistant";

function resolveMode(
  explicitMode: ThembaInput["mode"],
  activeTab: string,
): InternalMode {
  if (explicitMode === "bi") return "companion";
  if (explicitMode === "growth") return "growth";
  if (explicitMode === "assistant") return "assistant";
  return modeForTab(activeTab);
}

const MODE_INSTRUCTIONS: Record<InternalMode, string> = {
  companion: `**Business Companion / BI** — Focus on daily operations, immediate cash flow, and specific transactions. Be tactical. Cite specific record IDs, amounts, or stock counts from CONTEXT. If the user asks for predictions or long-term planning, briefly answer and suggest switching to Growth mode.`,

  growth: `**Growth & Strategy** — Focus on long-term planning, funding, expansion, and business models. Be strategic. Propose concrete next steps as specific tasks (not vague advice). Always ask for the trader's approval before suggesting any state changes.`,

  guide: `**SCRIBE Guide** — Focus on explaining how SCRIBE works: what the readiness score means, how evidence tiers affect credibility, how to use specific features. Do not invent business numbers. If the user actually wants business analysis, offer to switch modes.`,

  assistant: `**Assistant** — Help the trader draft messages, emails, or WhatsApp texts to suppliers or customers. Be polite, professional, and locally appropriate (South African English, ZAR amounts). Do NOT fabricate financial figures — if a number is needed, ask the trader to provide it.`,
};

const SYSTEM_PROMPT = (activeTab: string, mode: InternalMode) => `
You are Themba, SCRIBE's AI Business Operations Assistant for South African small businesses.

The user is currently looking at the **${activeTab.toUpperCase()}** tab.
YOUR ACTIVE MODE: ${MODE_INSTRUCTIONS[mode]}

IMPORTANT CONTEXT: You are looking at **Siyanda's Spaza**, a real 20-year-old business in Gugulethu/Khayelitsha.
The data you are analyzing is real historical data (2021-2026) provided by the owner.

CRITICAL INSTRUCTIONS:
1. You must output a strictly valid JSON object. Do not use markdown backticks.
2. Keep your "answer" under 120 words.
3. If you don't have the business data to answer, give general, practical business advice.

Schema:
{
  "answer": "Your conversational, helpful response here.",
  "proposed_action": {
    "type": "create_task" | "draft_message" | "record_stock_count" | "none",
    "title": "Short title",
    "description": "Detailed task description or the actual drafted text."
  }
}

RULES:
- If the user says "hello", "hey", "help", or "let's begin", greet them warmly and tell them you can check stock, draft messages, or create plans. Reference the current mode so they know what you can do in it.
- If the user asks to draft an email or message, set type to "draft_message" and write the draft in the "description" field.
- Never invent numbers. Use the CONTEXT.
- If asked to fix a stock variance, set type to "create_task".
- Never guarantee a loan. Never say someone is stealing.
- If no action is needed, set proposed_action to null.
`;

const LANGUAGE_NAMES = {
  en: "English",
  xh: "isiXhosa",
  zu: "isiZulu",
  af: "Afrikaans",
} as const;

function preflight(q: string, records: LedgerRecord[]): ThembaAnswer | null {
  const lower = q.toLowerCase();

  if (/(will i (get|be approved)|do i qualify|am i guaranteed|approve (my|the) (loan|credit))/i.test(lower)) {
    const score = consistencyScore(records);
    return {
      answer: `I can't tell you whether you'll get a loan — that's the lender's decision. What I can tell you is what your records show: documented readiness of ${score.low}–${score.high}/100 across ${records.length} sealed records.`,
      proposed_action: null,
      refused: true, refusal_reason: "credit_decision", provider: "fallback",
    };
  }

  if (/(should i (invest|borrow|take a loan|get a loan)|tax advice|stock market)/i.test(lower)) {
    return {
      answer: "I can't give regulated financial advice. I can help you organise your records and understand what they show — decisions about borrowing, investing, or tax should come from a qualified advisor.",
      proposed_action: null,
      refused: true, refusal_reason: "financial_advice", provider: "fallback",
    };
  }

  if (/(was i (robbed|stolen from)|is someone stealing|did .* steal)/i.test(lower)) {
    return {
      answer: "I can't determine whether theft happened — that's not what the records can establish. What I can show is the variance in your stock reconciliation.",
      proposed_action: null,
      refused: true, refusal_reason: "theft_verdict", provider: "fallback",
    };
  }

  return null;
}

function fallbackAnswer(
  question: string,
  records: LedgerRecord[],
  businessName: string,
  activeTab: string,
  mode: InternalMode,
): ThembaAnswer {
  const stock = reconcileStock(records);
  const revenue = revenueRange(records);
  const score = consistencyScore(records);
  const q = question.toLowerCase().trim();

  if (/^(hi|hello|hey|heyy|howzit|molo|sawubona|good (morning|afternoon|evening))/i.test(q)) {
    let modeContext: string;
    if (mode === "growth") {
      modeContext = "I see you're in planning mode. Do you want to draft a growth plan or explore funding options?";
    } else if (mode === "assistant") {
      modeContext = "What would you like to draft? A supplier message, a WhatsApp to a customer, or something else?";
    } else if (mode === "guide") {
      modeContext = "How can I help you navigate SCRIBE today?";
    } else {
      modeContext = "I see you're checking your daily operations. Do you want to investigate your stock, review recent sales, or record a new transaction?";
    }
    return {
      answer: `Hello! ${modeContext}`,
      proposed_action: null, refused: false, refusal_reason: null, provider: "fallback",
    };
  }
  if (/(are you (good|okay)|how are you|what\?|huh\?|okay|ok|yes|no|cool)/i.test(q)) {
    return { answer: `I'm doing well, thank you! I'm here to help you manage ${businessName}. We can look at your revenue, investigate stock, or draft a supplier email. What would you like to do?`, proposed_action: null, refused: false, refusal_reason: null, provider: "fallback" };
  }
  if (/(i need help|let's begin|start|help me)/i.test(q)) {
    return { answer: `I'm ready to help! Here are a few things we can do right now:\n1. Draft a supplier message.\n2. Investigate your stock variance.\n3. Create a growth plan for the week.\n\nJust tell me which one you'd like to start with.`, proposed_action: null, refused: false, refusal_reason: null, provider: "fallback" };
  }
  if (/(what does money mean|what is money|what do you mean)/i.test(q)) {
    return { answer: `Money represents the value exchanged for goods and services. In your business, tracking it helps you understand your profit and cash flow. Shall we look at your revenue range?`, proposed_action: null, refused: false, refusal_reason: null, provider: "fallback" };
  }
  if (/(draft|write|compose|email|message)/.test(q)) {
    const draftBody = stock.variance !== null && stock.variance !== 0
      ? `Molo,\n\nI am reviewing my records for ${businessName} and noticed a ${Math.abs(stock.variance)}-unit gap between expected stock (${stock.expected}) and the physical count (${stock.counted}). \n\nCould you please confirm the delivery quantities from the past week so I can reconcile my books?\n\nThanks.`
      : `Molo,\n\nI am reviewing my records for ${businessName} and would like to confirm a few details with you regarding my recent orders.\n\nThanks.`;
    return { answer: `Here is a draft you can edit before sending.`, proposed_action: { type: "draft_message", title: "Supplier Enquiry Draft", description: draftBody }, refused: false, refusal_reason: null, provider: "fallback" };
  }
  if (/(improve|better|grow|plan|score|business model|supplier)/.test(q)) {
    return { answer: `Your readiness is ${score.low}–${score.high}. The highest-leverage improvement right now is addressing your weakest component: ${score.components[0].label}.`, proposed_action: score.counterfactuals[0] ? { type: "create_task", title: "Improve Readiness", description: score.counterfactuals[0].action } : null, refused: false, refusal_reason: null, provider: "fallback" };
  }
  if (/(stock|inventory|short|variance)/.test(q)) {
    return { answer: `Expected close is ${stock.expected || 0} units; you counted ${stock.counted || 0}, a gap of ${Math.abs(stock.variance || 0)}.`, proposed_action: { type: "create_task", title: `Investigate ${Math.abs(stock.variance || 0)}-unit variance`, description: "Review delivery slips." }, refused: false, refusal_reason: null, provider: "fallback" };
  }

  return {
    answer: `I'm ready to help you grow ${businessName}. Your revenue range is R${(revenue.low_cents / 100).toFixed(0)}–R${(revenue.high_cents / 100).toFixed(0)}. What area do you want to investigate?`,
    proposed_action: null, refused: false, refusal_reason: null, provider: "fallback"
  };
}

export async function askThemba(input: ThembaInput): Promise<ThembaAnswer> {
  const {
    question,
    records,
    businessName,
    history = [],
    locale = "en",
    active_tab = "overview",
  } = input;

  // Resolve the effective mode: explicit user choice > tab-derived default.
  const mode = resolveMode(input.mode, active_tab);

  const refusal = preflight(question, records);
  if (refusal) return refusal;

  const languageLine = locale !== "en"
    ? `\n\nLANGUAGE INSTRUCTION: Respond in ${LANGUAGE_NAMES[locale]}. If you cannot produce a fluent response, respond in English and prefix with "[English fallback]".`
    : "";
  const systemPrompt = SYSTEM_PROMPT(active_tab, mode) + languageLine;

  const context = buildRichContext(records, businessName, history);
  const contextString = JSON.stringify(context);
  const historyString = history.slice(-4).map(h => `${h.role}: ${h.text}`).join('\n');

  // ─── 1. TRY GEMINI ───
  const geminiKeys = [process.env.key, process.env.key3, process.env.key4, process.env.GEMINI_API_KEY].filter(Boolean) as string[];
  const geminiModels = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

  for (const model of geminiModels) {
    for (const key of geminiKeys) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...history.slice(-4).map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
              { role: "user", parts: [{ text: `CONTEXT: ${contextString}\n\nUSER QUESTION: ${question}` }] }
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: "application/json" },
          }),
        });
        clearTimeout(timeout);

        if (!res.ok) {
          console.warn(`[Themba] Gemini ${model} failed:`, res.status);
          continue;
        }

        const json = await res.json();
        let text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;

        text = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(text);
        return { answer: parsed.answer, proposed_action: parsed.proposed_action?.type !== "none" ? parsed.proposed_action : null, refused: false, refusal_reason: null, provider: "gemini" };
      } catch (e) {
        // Silent catch, try next
      }
    }
  }

  // ─── 2. TRY GROQ ───
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `CONTEXT: ${contextString}\n\nHISTORY:\n${historyString}\n\nUSER QUESTION: ${question}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (res.ok) {
        const json = await res.json();
        let text = json.choices?.[0]?.message?.content;
        if (text) {
          text = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
          const parsed = JSON.parse(text);
          return { answer: parsed.answer, proposed_action: parsed.proposed_action?.type !== "none" ? parsed.proposed_action : null, refused: false, refusal_reason: null, provider: "groq" };
        }
      } else {
        console.warn(`[Themba] Groq failed:`, res.status);
      }
    } catch (e) {
      console.warn(`[Themba] Groq exception.`);
    }
  }

  // ─── 3. DETERMINISTIC FALLBACK ───
  return fallbackAnswer(question, records, businessName, active_tab, mode);
}