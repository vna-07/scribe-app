/**
 * SCRIBE Scam Shield — deterministic, rule-based risk assessment.
 *
 * Design principle: flag signals, never accuse. This is an advisor,
 * not a fraud verdict. A "high" rating means "check this before acting",
 * not "this is definitely a scam".
 */

export interface ScamSignal {
  signal: string;
  severity: "low" | "medium" | "high";
  evidence: string;
}

export interface ScamAssessment {
  risk: "low" | "medium" | "high";
  score: number; // 0-100, higher = more risk
  signals: ScamSignal[];
  advice: string[];
  summary: string;
  disclaimer: string;
}

interface Rule {
  signal: string;
  severity: "low" | "medium" | "high";
  weight: number;
  pattern: RegExp;
  evidenceLabel: string;
}

const RULES: Rule[] = [
  // ─── Payment before delivery ───────────────────────
  {
    signal: "Payment before delivery",
    severity: "high",
    weight: 25,
    pattern:
      /\b(deposit|pay (first|before|upfront|now)|upfront payment|payment before|eft before|clear funds|pay to (hold|secure|reserve))\b/i,
    evidenceLabel: 'Asks for payment before receiving goods or confirmation',
  },

  // ─── Urgency pressure ──────────────────────────────
  {
    signal: "Urgency pressure",
    severity: "medium",
    weight: 15,
    pattern:
      /\b(urgent(ly)?|immediately|act now|today only|before (it'?s gone|closing|end of day)|limited time|expires? (soon|today|in \d+)|right away|reply today|reply by|do it today)\b/i,
    evidenceLabel: "Pushes you to act quickly without time to check",
  },

  // ─── Payment method red flags ──────────────────────
  {
    signal: "Unusual payment method",
    severity: "high",
    weight: 25,
    pattern:
      /\b(gift card|voucher|itunes|google play|steam|bitcoin|crypto|usdt|e-?wallet|capitec e-?wallet|otp|one[- ]time pin)\b/i,
    evidenceLabel: 'Uses payment methods that are hard to reverse or trace',
  },

  // ─── Request for sensitive info ────────────────────
  {
    signal: "Requests sensitive information",
    severity: "high",
    weight: 30,
    pattern:
      /\b(otp|one[- ]time pin|password|pin|card number|cvv|banking details|account number|id number|id copy|log ?in)\b/i,
    evidenceLabel: "Asks for credentials or details that should never be shared",
  },

  // ─── Bank detail change ────────────────────────────
  {
    signal: "Banking details change",
    severity: "high",
    weight: 25,
    // Matches: "new banking details", "changed our account", "update banking",
    // "different account", "banking details have changed", "details have changed"
    pattern:
      /\b(new (bank|account|banking) details|changed? (our )?(bank|account)|update (our )?banking|different account|bank(ing)? details? (have )?changed?|(new|different) (bank|account) (details|number))\b/i,
    evidenceLabel: "Says the bank account has changed — classic impersonation signal",
  },

  // ─── Too good to be true ───────────────────────────
  {
    signal: "Too good to be true",
    severity: "high",
    weight: 25,
    pattern:
      /\b(guarantee(d)? (profit|return|win)|double your|triple your|risk[- ]free|100% (safe|guaranteed)|make you rich|easy money|free money|instant profit)\b/i,
    evidenceLabel: "Promises outcomes that are rarely genuine",
  },

  // ─── Threat / consequence ──────────────────────────
  {
    signal: "Threats or consequences",
    severity: "medium",
    weight: 15,
    pattern:
      /\b(account (will be )?(suspended|closed|blocked)|legal action|lose (the|your) (order|money|account)|arrest|police case|fine)\b/i,
    evidenceLabel: "Uses fear of consequences to push you into acting",
  },

  // ─── Off-platform redirect ─────────────────────────
  {
    signal: "Pushes off-platform",
    severity: "low",
    weight: 10,
    pattern:
      /\b(whatsapp me|call me on|dm me|move to (telegram|whatsapp)|message me on)\b/i,
    evidenceLabel: "Tries to move the conversation off official channels",
  },

  // ─── New supplier language ─────────────────────────
  {
    signal: "Unfamiliar supplier",
    severity: "low",
    weight: 10,
    pattern:
      /\b(new supplier|never worked with (you|us)|first order|haven'?t ordered|introduc(e|ing) (myself|ourselves)|sourcing from)\b/i,
    evidenceLabel: "First contact — worth verifying before you trust",
  },
];

function pickEvidence(message: string, pattern: RegExp): string {
  const m = message.match(pattern);
  return m ? m[0] : "";
}

function truncate(s: string, n = 40): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function analyzeMessage(message: string): ScamAssessment {
  const text = String(message || "").trim();
  if (text.length < 5) {
    return {
      risk: "low",
      score: 0,
      signals: [],
      advice: ["Paste the full message so I can check it properly."],
      summary: "Message too short to assess.",
      disclaimer:
        "Scam Shield flags signals, not certainties. It cannot confirm or rule out fraud.",
    };
  }

  const matched: ScamSignal[] = [];
  let totalWeight = 0;
  let maxSeverity: "low" | "medium" | "high" = "low";

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      const evidence = pickEvidence(text, rule.pattern);
      matched.push({
        signal: rule.signal,
        severity: rule.severity,
        evidence: evidence
          ? `Detected phrase: "${truncate(evidence)}". ${rule.evidenceLabel}.`
          : rule.evidenceLabel,
      });
      totalWeight += rule.weight;
      if (rule.severity === "high") maxSeverity = "high";
      else if (rule.severity === "medium" && maxSeverity !== "high") maxSeverity = "medium";
    }
  }

  const score = Math.min(100, totalWeight);

  let risk: "low" | "medium" | "high";
  if (matched.length === 0) risk = "low";
  else if (score >= 40 || maxSeverity === "high") risk = "high";
  else if (score >= 15 || maxSeverity === "medium") risk = "medium";
  else risk = "low";

  // ─── Advice ─────────────────────────────────────────
  const advice: string[] = [];

  if (risk === "high") {
    advice.push("Do not pay, share details, or click links until you've verified the sender independently.");
    advice.push("Phone the supplier on a number you already have — not the number in this message.");
  }
  if (matched.some((m) => m.signal === "Payment before delivery")) {
    advice.push("Ask the supplier to send an invoice with their registered business details before any payment.");
  }
  if (matched.some((m) => m.signal === "Banking details change")) {
    advice.push("Confirm any account change by calling the supplier on their usual landline or a known number.");
  }
  if (matched.some((m) => m.signal === "Requests sensitive information")) {
    advice.push("Never share OTPs, PINs, or banking passwords — legitimate suppliers don't ask for these.");
  }
  if (matched.some((m) => m.signal === "Unusual payment method")) {
    advice.push("Gift cards, vouchers, and crypto are not normal for stock purchases. Ask why before proceeding.");
  }
  if (matched.some((m) => m.signal === "Unfamiliar supplier")) {
    advice.push("Ask for their business registration number and a physical address you can verify.");
  }
  if (advice.length === 0) {
    advice.push("Nothing here raises obvious red flags, but verify the sender before sending money.");
  }

  // ─── Summary ────────────────────────────────────────
  let summary: string;
  if (matched.length === 0) {
    summary =
      "I didn't find obvious red flags in this message. That's not a green light — verify the sender before you act.";
  } else if (risk === "high") {
    summary = `I found ${matched.length} risk signal${matched.length === 1 ? "" : "s"} in this message. Several are high-severity. Do not send money or share details until you've verified who you're talking to.`;
  } else if (risk === "medium") {
    summary = `I found ${matched.length} signal${matched.length === 1 ? "" : "s"} worth checking. This isn't a confirmed scam — but slow down and verify before you act.`;
  } else {
    summary = `I noticed ${matched.length} minor signal${matched.length === 1 ? "" : "s"}. Probably fine, but read carefully.`;
  }

  return {
    risk,
    score,
    signals: matched,
    advice,
    summary,
    disclaimer:
      "Scam Shield flags risks based on words and patterns. It cannot confirm or rule out fraud. Always verify the sender before sending money or sharing details.",
  };
}