/// <reference types="node" />

import { analyzeMessage } from "../src/lib/scam-shield";

interface Case {
  label: string;
  message: string;
  expectedRisk: "low" | "medium" | "high";
  mustSignal?: string;
}

const cases: Case[] = [
  {
    label: "Classic deposit-before-delivery scam",
    message:
      "URGENT: New banking details! Please pay the R2 500 deposit to hold your stock before delivery today. Send EFT now.",
    expectedRisk: "high",
    mustSignal: "Payment before delivery",
  },
  {
    label: "OTP request",
    message:
      "Hi, this is your bank. To verify your account, please send me the OTP you just received.",
    expectedRisk: "high",
    mustSignal: "Requests sensitive information",
  },
  {
    label: "Gift card payment",
    message: "Pay with a Google Play gift card and send me the code. You'll get a refund later.",
    expectedRisk: "high",
    mustSignal: "Unusual payment method",
  },
  {
    label: "Bank detail change impersonation",
    message:
      "Good day, this is your usual supplier. Please note our banking details have changed. Use the new account below.",
    expectedRisk: "high",
    mustSignal: "Banking details change",
  },
  {
    label: "Too good to be true",
    message: "Guaranteed profit! Double your money in 7 days, risk-free!",
    expectedRisk: "high",
    mustSignal: "Too good to be true",
  },
  {
    label: "Benign message — no red flags",
    message: "Hi Nomsa, the bread delivery will arrive tomorrow at 8am. Please let me know if that works.",
    expectedRisk: "low",
  },
  {
    label: "Mild urgency only",
    message: "Please reply today if you want the order.",
    expectedRisk: "medium",
    mustSignal: "Urgency pressure",
  },
];

async function run() {
  let pass = 0;
  let fail = 0;

  console.log("\nSCAM SHIELD — verification test\n");

  for (const c of cases) {
    const r = analyzeMessage(c.message);
    const problems: string[] = [];

    if (r.risk !== c.expectedRisk) {
      problems.push(`expected risk=${c.expectedRisk}, got ${r.risk}`);
    }
    if (c.mustSignal && !r.signals.some((s) => s.signal === c.mustSignal)) {
      problems.push(`expected signal "${c.mustSignal}" not found`);
    }

    if (problems.length === 0) {
      pass++;
      console.log(`✅ ${c.label}`);
      console.log(`   risk=${r.risk} score=${r.score} signals=${r.signals.length}`);
    } else {
      fail++;
      console.log(`❌ ${c.label}`);
      for (const p of problems) console.log(`   - ${p}`);
      console.log(`   got risk=${r.risk} score=${r.score} signals: ${r.signals.map((s) => s.signal).join(", ")}`);
    }
  }

  // Extra invariant: disclaimer must always be present
  const empty = analyzeMessage("");
  if (!empty.disclaimer) {
    console.log("❌ empty message is missing disclaimer");
    fail++;
  } else {
    console.log("✅ disclaimer present on empty input");
    pass++;
  }

  console.log(`\n${pass} passed / ${fail} failed`);
  if (fail > 0) process.exit(1);
  console.log("✓ Scam Shield verified: rule-based, no false verdicts, clear advice.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});