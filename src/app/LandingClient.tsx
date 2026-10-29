"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode, type CSSProperties, type MouseEvent as RMouseEvent } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   SCRIBE landing page — Team CODE BLOODED
   FNB App of the Year 2026 · competition submission
   Prototype build. All demo data is synthetic and labelled as such.
   ═══════════════════════════════════════════════════════════════ */

const TELEGRAM_URL = "https://t.me/ScribeIntellegenceBot";
const CONTACT_EMAIL = "avianrossi@gmail.com";
const GITHUB_URL = "https://github.com/vna-07/scribe-app";

/* ─── Icons (inline — no lucide-react dependency) ────────────── */
type IconProps = { size?: number; color?: string; className?: string; style?: CSSProperties };

function SVGIcon({ children, size = 24, color, className = "", style }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
const ArrowRight   = (p: IconProps) => <SVGIcon {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></SVGIcon>;
const ArrowLeft    = (p: IconProps) => <SVGIcon {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></SVGIcon>;
const ArrowUpRight = (p: IconProps) => <SVGIcon {...p}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></SVGIcon>;
const Banknote     = (p: IconProps) => <SVGIcon {...p}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></SVGIcon>;
const FileText     = (p: IconProps) => <SVGIcon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></SVGIcon>;
const ShieldAlert  = (p: IconProps) => <SVGIcon {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></SVGIcon>;
const Layers       = (p: IconProps) => <SVGIcon {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></SVGIcon>;
const BookOpen     = (p: IconProps) => <SVGIcon {...p}><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></SVGIcon>;
const Lock         = (p: IconProps) => <SVGIcon {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></SVGIcon>;
const Eye          = (p: IconProps) => <SVGIcon {...p}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></SVGIcon>;
const Clock        = (p: IconProps) => <SVGIcon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SVGIcon>;
const Sparkles     = (p: IconProps) => <SVGIcon {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></SVGIcon>;
const Shield       = (p: IconProps) => <SVGIcon {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></SVGIcon>;
const Check        = (p: IconProps) => <SVGIcon {...p}><path d="M20 6 9 17l-5-5"/></SVGIcon>;
const XIcon        = (p: IconProps) => <SVGIcon {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></SVGIcon>;
const ChevronDown  = (p: IconProps) => <SVGIcon {...p}><path d="m6 9 6 6 6-6"/></SVGIcon>;
const Bot          = (p: IconProps) => <SVGIcon {...p}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></SVGIcon>;
const MenuIcon     = (p: IconProps) => <SVGIcon {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></SVGIcon>;
const Send         = (p: IconProps) => <SVGIcon {...p}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></SVGIcon>;
const MessageCircle = (p: IconProps) => <SVGIcon {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></SVGIcon>;
const Plug         = (p: IconProps) => <SVGIcon {...p}><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></SVGIcon>;
const Store        = (p: IconProps) => <SVGIcon {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></SVGIcon>;
const CreditCard   = (p: IconProps) => <SVGIcon {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></SVGIcon>;
const Truck        = (p: IconProps) => <SVGIcon {...p}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></SVGIcon>;
const Calculator   = (p: IconProps) => <SVGIcon {...p}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M16 14h.01M12 18h.01M8 18h.01M16 18h.01"/></SVGIcon>;
const Briefcase    = (p: IconProps) => <SVGIcon {...p}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></SVGIcon>;

type IconC = typeof Lock;

/* ─── Tokens ─────────────────────────────────────────────────── */
const NAVY = "#14173F";
const INDIGO = "#5B5BE0";
const DEEP = "#4B4FC9";
const SLATE = "#2F3463";   /* darker than before so body text stays readable on tinted backgrounds */
const LAV = "#A9AEFF";

type VerdictKey = "SEALED" | "WARN" | "BROKEN";
const VERDICT: Record<VerdictKey, { c: string; tint: string; blob: string; label: string; sub: string }> = {
  SEALED: { c: "#47745D", tint: "#E3F0E8", blob: "#7CB09A", label: "SEALED", sub: "Unchanged since saved" },
  WARN:   { c: "#B07C00", tint: "#FFF4DC", blob: "#F2B84B", label: "REVIEW", sub: "Needs your attention" },
  BROKEN: { c: "#A94E40", tint: "#F6E3DD", blob: "#E8806C", label: "CHANGED", sub: "Edited after sealing" },
};

type ThemeKey = "light" | "warm" | "mint" | "dark";
const THEMES: Record<ThemeKey, { bg: string; a: string; b: string; dot: string }> = {
  light: { bg: "#E9EBFF", a: "#D5D9FF", b: INDIGO,    dot: "rgba(20,23,63,.08)" },
  warm:  { bg: "#FBF1D9", a: "#FCE7B4", b: "#D99A00", dot: "rgba(120,80,0,.09)" },
  mint:  { bg: "#E4F0E8", a: "#C7E0D3", b: "#47745D", dot: "rgba(30,90,60,.10)" },
  dark:  { bg: NAVY,       a: "#232A5C", b: LAV,       dot: "rgba(255,255,255,.06)" },
};

/* ─── Competition submission details ─────────────────────────── */
const SUBMISSION = {
  comp: "FNB App of the Year 2026",
  team: "Team CODE BLOODED · SCRIBE Intelligence",
  track: "Financial inclusion and money confidence",
  aspect: "Youth employment and work readiness",
};

/* ─── Content ────────────────────────────────────────────────── */
interface Scenario {
  id: string;
  tab: string;
  verdict: VerdictKey;
  sub?: string;
  chat: string;
  head: [string, string, string];
  fields: [string, string, string, boolean][];
  reasons: string[];
  say: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "sale", tab: "Recorded sale", verdict: "SEALED",
    chat: "“Sold 3 Albany bread for R45 to a walk-in.”",
    head: ["Check", "Expected", "Found"],
    fields: [
      ["Amount", "R45.00", "R45.00", true],
      ["Item", "Albany Bread", "Albany Bread", true],
      ["Seal", "a8f9c2…", "a8f9c2…", true],
      ["Signature", "Ed25519", "Valid", true],
    ],
    reasons: ["The record has not changed since it was saved.", "A seal shows the record is unaltered. It cannot show the sale really happened."],
    say: "This record is intact. Its evidence tier is self-reported, because it came from your voice note.",
  },
  {
    id: "tamper", tab: "Edited record", verdict: "BROKEN",
    chat: "“The total was changed after it was saved.”",
    head: ["Check", "Sealed value", "Found now"],
    fields: [
      ["Amount", "R45.00", "R54.00", false],
      ["Item", "Albany Bread", "Albany Bread", true],
      ["Seal", "a8f9c2…", "f3d4e1…", false],
      ["Signature", "Ed25519", "Mismatch", false],
    ],
    reasons: ["The stored seal no longer matches the record's contents.", "Records after this one are flagged for review until you restore or explain the change."],
    say: "This record was edited after it was sealed. Restore it from backup, or note why it changed.",
  },
  {
    id: "variance", tab: "Stock variance", verdict: "WARN",
    chat: "“I counted 30 bags of maize meal.”",
    head: ["Check", "From records", "Counted"],
    fields: [
      ["Stock on hand", "38 bags", "30 bags", false],
      ["Variance", "0", "−8 bags", false],
      ["Record seals", "Intact", "Intact", true],
    ],
    reasons: ["Records say 38 bags should be on the shelf. The physical count is 30.", "The 8-bag variance stays open until you explain it or write it off."],
    say: "Eight bags are unaccounted for. That could be an unrecorded sale, spoilage or a counting slip. Tell me which, or open a case.",
  },
  {
    id: "export", tab: "Records export", verdict: "SEALED", sub: "Illustrative coverage",
    chat: "“Can I show a lender my last 6 months?”",
    head: ["Check", "Target", "Found"],
    fields: [
      ["Months covered", "6", "6", true],
      ["Records", "—", "412", true],
      ["Seals intact", "412", "412", true],
      ["With evidence attached", "412", "375", false],
    ],
    reasons: ["Coverage score (illustrative): 78–84. It measures how much of the period has records and evidence. It is not a credit score.", "37 records have no receipt or photo attached, so they stay self-reported."],
    say: "You can export these records for a lender to assess. They decide what it means for credit, not SCRIBE.",
  },
];

/* Interactive product preview data (fictional business) */
interface Txn {
  id: string; when: string; kind: string; title: string; amount: string; source: string;
  tier: string; verdict: VerdictKey; raw: string;
  fields: [string, string][]; checks: [string, boolean][]; say: string;
}
const TXNS: Txn[] = [
  { id: "t1", when: "Mon 08:14", kind: "Sale", title: "3 × Albany bread", amount: "+R45.00", source: "Voice note", tier: "Self-reported", verdict: "SEALED",
    raw: "“Sold three Albany bread to a walk-in, forty-five rand.”",
    fields: [["Type", "Sale"], ["Item", "Albany bread"], ["Quantity", "3"], ["Amount", "R45.00"], ["Payment", "Cash"]],
    checks: [["Amount = quantity × shelf price (R15.00)", true], ["Stock reduced by 3", true], ["Seal intact", true]],
    say: "The amount matches 3 × R15.00 and stock dropped by 3. Because this came from your voice note, it is self-reported evidence. A till slip would lift it to document-backed." },
  { id: "t2", when: "Tue 10:02", kind: "Restock", title: "Cooking oil, 12 units", amount: "−R1,900.00", source: "Supplier invoice photo", tier: "Document-backed", verdict: "SEALED",
    raw: "Invoice photo: “Cooking oil 750ml × 12 — R1,900.00 — Tue”",
    fields: [["Type", "Restock"], ["Item", "Cooking oil 750ml"], ["Quantity", "12"], ["Amount", "R1,900.00"], ["Evidence", "Invoice photo"]],
    checks: [["Invoice total matches entered amount", true], ["Stock was below reorder level (12 < 20)", true], ["Seal intact", true]],
    say: "Profit dipped this week because of this one restock, not because sales fell. Stock was at 12 units, below your reorder level of 20." },
  { id: "t3", when: "Wed 07:40", kind: "Expense", title: "Fuel for deliveries", amount: "−R310.00", source: "Manual entry", tier: "Self-reported", verdict: "WARN",
    raw: "Typed: “fuel 310”",
    fields: [["Type", "Expense"], ["Category", "Transport"], ["Amount", "R310.00"], ["Evidence", "None attached"]],
    checks: [["Amount present", true], ["Receipt or photo attached", false], ["Seal intact", true]],
    say: "This expense has no receipt, so it counts as self-reported. It still counts toward your totals, but a lender or accountant would give it less weight. Attach a slip if you have one." },
  { id: "t4", when: "Thu 17:30", kind: "Stock count", title: "Maize meal 10 kg", amount: "−8 bags", source: "Manual count", tier: "Self-reported", verdict: "WARN",
    raw: "Typed: “counted 30 maize meal”",
    fields: [["Type", "Stock count"], ["From records", "38 bags"], ["Counted", "30 bags"], ["Variance", "−8 bags"]],
    checks: [["Counted equals expected", false], ["Variance explained", false], ["Seal intact", true]],
    say: "Records say 38 bags should be on the shelf and you counted 30. That is a variance of 8. The code calculated that, and I can’t tell you the cause. It could be unrecorded sales, spoilage or a miscount." },
  { id: "t5", when: "Fri 12:15", kind: "Sale", title: "Airtime bundle", amount: "+R100.00", source: "Till slip photo", tier: "Document-backed", verdict: "SEALED",
    raw: "Slip photo: “Airtime R100.00 — Fri 12:15”",
    fields: [["Type", "Sale"], ["Item", "Airtime R100"], ["Amount", "R100.00"], ["Evidence", "Slip photo"]],
    checks: [["Slip total matches amount", true], ["Seal intact", true]],
    say: "The slip and the entered amount agree. This record is document-backed. Only a bank or provider could confirm the payment itself." },
];

const MOMENTS = [
  { icon: Banknote, title: "Cash leaves no trail",
    scam: "Sales recorded on scrap paper, in a WhatsApp thread, or only in memory. At month-end, half the money has no story.",
    help: "SCRIBE gives each transaction a home. Voice, photo, CSV or manual entry, and the record is sealed when you confirm and save it." },
  { icon: Layers, title: "Stock doesn’t add up",
    scam: "You bought 200 units, recorded 150 sold, and the shelf shows 42. Something is off, but not what.",
    help: "SCRIBE compares stock with the sales and receipts you’ve captured, and surfaces variances instead of burying them." },
  { icon: FileText, title: "A lender asks for proof",
    scam: "You have six months of hustle but no six months of records. The bank wants statements you can’t produce.",
    help: "SCRIBE turns daily captures into an evidence-linked records export a lender can assess. The lender makes the decision." },
  { icon: ShieldAlert, title: "Someone edits the books",
    scam: "A number changes. A description shifts. Without a trail, nobody can show it happened.",
    help: "SCRIBE’s hash chain makes edits detectable. Restore from backup, or record why the change happened." },
];

const STEPS: { h: string; d: string; tag: string }[] = [
  { h: "Capture",   d: "Voice, photo, CSV or manual entry, the way you already work.", tag: "You" },
  { h: "Structure", d: "Details are extracted into a fixed format: amount, item, date, evidence tier. You confirm before anything is sealed.", tag: "Automatic extraction · you confirm" },
  { h: "Reconcile", d: "Fixed rules compare stock, sales and receipts. Every number comes from code you can test.", tag: "Deterministic code" },
  { h: "Explain",   d: "Themba explains the result in plain language, grounded in your own records. It never changes the numbers.", tag: "Grounded AI" },
  { h: "Verify",    d: "Records are hash-chained and signed, so later edits become detectable.", tag: "Cryptographic check" },
];

const CHAT: { from: "you" | "t"; t: string; draft?: boolean }[] = [
  { from: "you", t: "Why did my profit drop last week?" },
  { from: "t",   t: "Recorded sales were flat at R18,420, within 1% of the week before. But expenses rose by R2,410." },
  { from: "t",   t: "R1,900 was a cooking-oil restock on Tuesday and R310 was fuel. One supply run explains the drop, not a sales problem." },
  { from: "you", t: "Was that restock necessary?" },
  { from: "t",   t: "You were at 12 units, below your reorder level of 20, so it looks reasonable. Next time you could split the order over two invoices to ease cash flow.", draft: true },
];

const STATS: [number, string, string][] = [
  [5, "", "stages from capture to a verified explanation"],
  [3, "", "evidence tiers, stated plainly"],
  [1, "", "rule: code decides, Themba explains"],
  [0, "", "bank logins ever requested"],
];

const TRUST: [IconC, string, string][] = [
  [Lock,     "Rules decide, Themba explains", "Themba can raise a warning. It is designed never to turn a warning into an approval."],
  [Shield,   "Tamper-evident by design",      "Records are hash-chained and Ed25519-signed, so a later change becomes detectable."],
  [Eye,      "Evidence tiers, stated honestly", "A seal shows a record wasn’t altered, not that the sale happened. Each record shows how well it is evidenced."],
  [Clock,    "Short retention",               "Attach only what you need. Delete records when you are done with them."],
  [Sparkles, "No unverified claims",          "Themba does not say a loan was approved or a payment arrived. The bank has the final word."],
  [BookOpen, "Honest about the prototype",    "This build uses synthetic data only. Legal and privacy positions are provisional."],
];

const IMPACT: { icon: IconC; head: string; sub: string; points: [string, string, boolean][] }[] = [
  { icon: Banknote, head: "Money confidence", sub: "For people with irregular income and little access to formal services.",
    points: [
      ["Plain-language answers to “where did my money go?”", "Prototype", true],
      ["Early flags for stock gaps, missing receipts and edited records", "Prototype", true],
      ["Evidence-linked records export a lender can assess", "Prototype", true],
      ["Chat access through Telegram, lighter than a heavy app", "Available", true],
      ["Voice capture in more South African languages", "Planned", false],
    ] },
  { icon: Briefcase, head: "Work readiness", sub: "For young people earning informally whose work leaves no CV trail.",
    points: [
      ["Informal trading becomes a dated activity history", "Prototype", true],
      ["Exportable records as practical-experience evidence for mentors or programmes", "Prototype", true],
      ["Habits built along the way: record-keeping, stock control, margins", "Prototype", true],
      ["Employer or programme verification links", "Planned", false],
    ] },
];

const CONNECTIONS: { icon: IconC; name: string; status: string; adds: string; tier: string }[] = [
  { icon: Store,      name: "POS",        status: "Proposed", adds: "Imports till sales so SCRIBE can compare them with what you recorded.", tier: "Document-backed" },
  { icon: CreditCard, name: "Payments",   status: "Roadmap",  adds: "Brings in payment confirmations from providers, so cashless sales can be matched.", tier: "Third-party confirmed" },
  { icon: Truck,      name: "Suppliers",  status: "Roadmap",  adds: "Receives supplier invoices directly, so restocks arrive with their evidence.", tier: "Third-party confirmed" },
  { icon: Calculator, name: "Accounting", status: "Roadmap",  adds: "Sends sealed records to the accountant’s tools, so nobody retypes them.", tier: "Export" },
];

const POS_ROWS: [string, number, number][] = [
  ["Albany bread", 14, 11],
  ["Cooking oil 750 ml", 6, 6],
  ["Airtime R100", 9, 9],
];

const ROADMAP: [string, string[], boolean][] = [
  ["Now · prototype", ["Voice, photo and manual capture", "Hash-chained records", "Themba explanations", "Telegram bot"], true],
  ["Next", ["CSV and POS-export import", "Evidence-backed lender export", "More languages for capture"], false],
  ["Later", ["Payment confirmations", "Supplier invoice feeds", "Accounting hand-off", "WhatsApp"], false],
];

const FAQ: [string, string][] = [
  ["Is SCRIBE a bookkeeping app?", "Bookkeeping records what happened. SCRIBE also seals each record, so any later change becomes detectable, and ties it to its evidence. That makes the ledger easier to hand to a lender or accountant."],
  ["Can I edit a record after I’ve saved it?", "You can, but SCRIBE will show the edit. The stored seal no longer matches the record, and the chain is flagged from that point. Correct mistakes freely. The ledger remembers that you did."],
  ["Does it connect to my bank?", "No. SCRIBE never asks for a bank login. You send what you already have: voice, photo, CSV or manual entry. Bank, POS or payment feeds are roadmap items and would come through partner integrations."],
  ["What does Themba actually do?", "Themba is an explanation layer, not a decision maker. Code calculates every number, and Themba explains it in plain language using your records. If Themba is unavailable, plain templates take over."],
  ["Can I use it on WhatsApp?", "Not yet. Telegram is available to try now, and WhatsApp is planned. We’ll show WhatsApp as live only once it works."],
  ["Is my data safe?", "Records are sealed when saved, and evidence is stored with the record. Nothing is shared without your explicit action. This build uses synthetic data only, and legal and privacy positions are provisional."],
  ["Why would it be free for small businesses?", "Lenders, suppliers and payment providers benefit from provable records, and could sponsor protection for their merchants. That is a hypothesis we still need to test in a pilot."],
];

const TEAM = [
  { initials: "AV", name: "Ayolela Vena", role: "Founding Member · Technology, Intelligence & Quantitative Research",
    desc: "Established SCRIBE’s original vision and technical foundation, leading systems architecture, AI integration, data science, quantitative analysis and product development.",
    focus: "Turning business evidence into reliable, explainable intelligence." },
  { initials: "LK", name: "Lindokuhle Klaas", role: "Founding Team · People, Administration & Organisational Development",
    desc: "Brings an organisational perspective to SCRIBE’s development, covering administration, people management, structure and governance, aligned with studies in administration and human resources.",
    focus: "Building an organisation and product that understand the people they serve." },
  { initials: "LR", name: "Leopa Ross", role: "Founding Team · Finance, Commercial Strategy & Capital",
    desc: "Contributes a financial and commercial perspective on financial strategy, capital allocation and commercial development, aligned with studies in finance.",
    focus: "Shaping a sustainable business model and a path to long-term growth." },
];

/* Competition challenges + solution (bottom of page) */
const CHALLENGES: {
  num: string; name: string; problemHead: string; problem: string;
  respHead: string; resp: string; tags: string[];
}[] = [
  { num: "01", name: "Financial inclusion and money confidence",
    problemHead: "How might we make everyday money management simpler, safer and more useful?",
    problem: "For people with irregular incomes, limited financial knowledge or limited access to formal services, understanding everyday finances can be difficult. Scattered records and unclear financial activity can make it harder to see where money goes, identify problems and plan ahead.",
    respHead: "How SCRIBE responds",
    resp: "SCRIBE helps organise business transactions and supporting documents into a clearer financial picture. By structuring records, surfacing discrepancies for review and explaining available information, it aims to make financial activity easier to understand and act on.",
    tags: ["Money visibility", "Record organisation", "Evidence-linked insights", "Safer financial decisions"] },
  { num: "02", name: "Youth employment and work readiness",
    problemHead: "How might we shorten the distance between young people and meaningful income?",
    problem: "Young people can struggle to turn their skills and experience into credible profiles, practical opportunities and career mobility. Informal work and self-employment can also produce valuable experience that is difficult to document.",
    respHead: "Where SCRIBE connects",
    resp: "SCRIBE’s primary focus is small-business financial intelligence, not recruitment or job matching. However, by helping young entrepreneurs and small-business owners organise business activity and build clearer records, it can support the development of more structured, sustainable income-generating activity. Direct skills verification and job matching would be a separate future direction, not a current SCRIBE capability.",
    tags: ["Youth entrepreneurship", "Small-business operations", "Income visibility", "Future opportunity"] },
];

const SOLUTION: [string, string][] = [
  ["Capture and structure", "Bring supported business records into one organised workflow."],
  ["Review and reconcile", "Surface discrepancies in the available data without automatically assuming fraud or error."],
  ["Understand and act", "Use business summaries and the Themba assistant to investigate records and consider next steps."],
];

const ROTATING = ["a sale happens in cash", "stock doesn’t reconcile", "a lender asks for proof", "someone edits the books"];

const NAV: [string, string][] = [
  ["submission", "Submission"], ["preview", "Product"], ["how", "How it works"], ["integrations", "Integrations"],
  ["themba", "Themba"], ["trust", "Trust"], ["team", "Team"], ["faq", "FAQ"], ["challenges", "Challenges"], ["contact", "Contact"],
];

/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
@keyframes sk-drift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(70px,-40px) scale(1.12)}66%{transform:translate(-50px,35px) scale(.94)}}
@keyframes sk-drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-80px,60px) scale(1.1)}}
@keyframes sk-drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,-70px) scale(1.15)}}
@keyframes sk-hue{0%,100%{filter:hue-rotate(-24deg)}50%{filter:hue-rotate(28deg)}}
@keyframes sk-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes sk-pop{0%{opacity:0;transform:translateY(10px) scale(.97)}100%{opacity:1;transform:none}}
@keyframes sk-scan{0%{top:-4%}100%{top:104%}}
@keyframes sk-ring{0%{box-shadow:0 0 0 0 rgba(91,91,224,.5)}100%{box-shadow:0 0 0 14px rgba(91,91,224,0)}}
@keyframes sk-float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-16px) rotate(calc(var(--r,0deg) + 4deg))}}
@keyframes sk-dots{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes sk-shine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes sk-fade{from{opacity:0}to{opacity:1}}
.sk-drift1{animation:sk-drift1 26s ease-in-out infinite}
.sk-drift2{animation:sk-drift2 32s ease-in-out infinite}
.sk-drift3{animation:sk-drift3 38s ease-in-out infinite}
.sk-hue{animation:sk-hue 22s ease-in-out infinite}
.sk-marquee{animation:sk-marquee 38s linear infinite}
.sk-pop{animation:sk-pop .45s cubic-bezier(.2,.8,.2,1) both}
.sk-fade{animation:sk-fade .25s ease both}
.sk-scan{animation:sk-scan 1.8s linear infinite}
.sk-ring{animation:sk-ring 1.6s ease-out infinite}
.sk-float{animation:sk-float 9s ease-in-out infinite}
.sk-dot{animation:sk-dots 1.1s infinite}
.sk-shine{background-image:linear-gradient(90deg,${NAVY} 0%,${INDIGO} 50%,${NAVY} 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sk-shine 7s linear infinite}
.sk-lede{background:rgba(255,255,255,.78);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-radius:14px;padding:.75rem 1rem;width:fit-content;max-width:100%}
.sk-dark .sk-lede{background:rgba(14,17,48,.8)}
.sk-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.sk-reveal.in{opacity:1;transform:none}
.sk-b1,.sk-b2,.sk-b3{position:absolute;border-radius:9999px;will-change:transform}
.sk-b1{top:-11rem;left:50%;width:min(820px,150vw);height:min(820px,150vw);margin-left:calc(min(820px,150vw) / -2);filter:blur(110px)}
.sk-b2{top:8%;right:-10rem;width:min(560px,110vw);height:min(560px,110vw);filter:blur(130px)}
.sk-b3{bottom:-10rem;left:-10rem;width:min(520px,100vw);height:min(520px,100vw);filter:blur(120px)}
.sk-root{-webkit-tap-highlight-color:transparent;overflow-x:clip}
.sk-root section[id],.sk-root header[id]{scroll-margin-top:5rem}
.sk-root a:focus-visible,.sk-root button:focus-visible{outline:2px solid ${DEEP};outline-offset:3px;border-radius:8px}
.sk-dark a:focus-visible,.sk-dark button:focus-visible{outline-color:${LAV}}
.sk-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
@media (max-width:767px){
  .sk-b1{filter:blur(70px)} .sk-b2{filter:blur(80px)} .sk-b3{filter:blur(80px)}
  .sk-hue{animation:none}
  .sk-drift2,.sk-drift3{animation:none}
}
@media (prefers-reduced-motion:reduce){
  .sk-root *{animation:none!important;transition:none!important}
  .sk-reveal{opacity:1;transform:none}
}
.sk-root{color-scheme:light}
.sk-root .bg-white{background-color:#fff!important}
.sk-root .bg-white\\/95{background-color:rgba(255,255,255,.96)!important}
.sk-root .bg-white\\/92{background-color:rgba(255,255,255,.94)!important}
.sk-root .bg-white\\/90{background-color:rgba(255,255,255,.93)!important}
.sk-root .bg-white\\/85{background-color:rgba(255,255,255,.9)!important}
.sk-root .bg-white\\/80{background-color:rgba(255,255,255,.86)!important}
.sk-root .bg-white\\/70{background-color:rgba(255,255,255,.78)!important}
.sk-root [class*="bg-[#F1F2FF]"]{background-color:#F1F2FF!important}
.sk-root [class*="bg-[#F6F7FF]"]{background-color:#F6F7FF!important}
.sk-root [class*="bg-[#F3F4FF]"]{background-color:#F3F4FF!important}
`;

/* ─── Helpers ────────────────────────────────────────────────── */
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`sk-reveal ${shown ? "in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") { setN(to); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 1200, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Tilt only on devices with a real hover pointer. Touch screens get a plain wrapper. */
function Tilt({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [can, setCan] = useState(false);
  useEffect(() => {
    setCan(window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion());
  }, []);
  const move = (e: RMouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={can ? move : undefined} onMouseLeave={can ? leave : undefined}
      className={`${can ? "transition-transform duration-200 will-change-transform" : ""} ${className}`}>
      {children}
    </div>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

function Pill({ children, color = NAVY, bg = "rgba(20,23,63,.08)" }: { children: ReactNode; color?: string; bg?: string }) {
  return <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap" style={{ color, backgroundColor: bg }}>{children}</span>;
}

/* ─── Dynamic background (calmer blobs so text stays readable) ── */
function Backdrop({ t, dark }: { t: { bg: string; a: string; b: string; dot: string }; dark: boolean }) {
  const tr = "background-color 1.4s ease";
  const mask = "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)";
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: t.bg, transition: tr }}>
      <div className="absolute inset-0 sk-hue">
        <div className="sk-b1 sk-drift1" style={{ backgroundColor: t.a, opacity: dark ? 0.6 : 0.55, transition: tr }} />
        <div className="sk-b2 sk-drift2" style={{ backgroundColor: t.b, opacity: dark ? 0.08 : 0.12, transition: tr }} />
        <div className="sk-b3 sk-drift3" style={{ backgroundColor: t.b, opacity: dark ? 0.06 : 0.09, transition: tr }} />
      </div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(${t.dot} 1px, transparent 1px)`, backgroundSize: "28px 28px",
        maskImage: mask, WebkitMaskImage: mask,
      }} />
      <div className="absolute inset-0 hidden md:block" style={{
        background: "radial-gradient(480px circle at var(--mx,50%) var(--my,30%), rgba(91,91,224,.10), transparent 62%)",
      }} />
    </div>
  );
}

/* ─── Competition submission badge + banner ──────────────────── */
function SubmissionBadge() {
  return (
    <div className="rounded-2xl border-2 p-4 sm:p-5 mb-8 bg-white/95 shadow-lg max-w-xl" style={{ borderColor: NAVY }}>
      <p className="text-xs font-black tracking-[0.2em] mb-1" style={{ color: DEEP }}>COMPETITION SUBMISSION</p>
      <p className="text-xl sm:text-2xl font-black leading-tight">{SUBMISSION.comp}</p>
      <p className="text-sm font-semibold mt-1">{SUBMISSION.team}</p>
      <p className="text-sm mt-2" style={{ color: SLATE }}>
        Challenge 01: <b>{SUBMISSION.track}</b><br />Challenge 02: <b>{SUBMISSION.aspect}</b>
      </p>
    </div>
  );
}

function SubmissionBanner() {
  return (
    <section id="submission" data-theme="light" className="py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
        <Reveal>
          <div className="rounded-3xl bg-white/95 border-2 shadow-xl p-6 md:p-10 grid md:grid-cols-[1.2fr_1fr] gap-6 md:gap-10 items-center" style={{ borderColor: NAVY }}>
            <div>
              <p className="inline-block text-xs font-black tracking-[0.2em] px-4 py-2 rounded-full mb-4 text-white" style={{ backgroundColor: NAVY }}>COMPETITION SUBMISSION</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{SUBMISSION.comp}</h2>
              <p className="text-lg font-semibold" style={{ color: DEEP }}>{SUBMISSION.team}</p>
            </div>
            <div className="space-y-3">
              {[["Challenge 01", SUBMISSION.track], ["Challenge 02", SUBMISSION.aspect]].map(([k, v]) => (
                <div key={k} className="rounded-xl p-4" style={{ backgroundColor: "#EEF0FF" }}>
                  <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: DEEP }}>{k}</p>
                  <p className="font-bold">{v}</p>
                </div>
              ))}
              <button type="button" onClick={() => scrollToId("challenges")} className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4 decoration-2" style={{ color: DEEP }}>
                See how SCRIBE answers both <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Verdict card + live check ──────────────────────────────── */
function VerdictCard({ s }: { s: Scenario }) {
  const v = VERDICT[s.verdict];
  return (
    <div className="sk-pop rounded-2xl bg-white border overflow-hidden shadow-xl" style={{ borderColor: `${v.c}55` }}>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 text-white" style={{ backgroundColor: v.c }}>
        <span className="font-black tracking-wide text-base sm:text-lg">{v.label}</span>
        <span className="text-xs font-semibold opacity-90 text-right">{s.sub ?? v.sub}</span>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        <div className="sk-scroll -mx-1 px-1">
          <table className="w-full text-sm min-w-[16rem]">
            <thead>
              <tr className="text-left text-xs" style={{ color: SLATE }}>
                <th className="font-semibold pb-1 pr-2">{s.head[0]}</th>
                <th className="font-semibold pb-1 pr-2">{s.head[1]}</th>
                <th className="font-semibold pb-1 pr-2">{s.head[2]}</th>
                <th><span className="sr-only">Result</span></th>
              </tr>
            </thead>
            <tbody>
              {s.fields.map(([k, exp, got, ok]) => (
                <tr key={k} className="border-t border-black/5">
                  <td className="py-1.5 pr-2 font-semibold">{k}</td>
                  <td className="py-1.5 pr-2">{exp}</td>
                  <td className="py-1.5 pr-2 font-semibold" style={{ color: ok ? NAVY : VERDICT.BROKEN.c }}>{got}</td>
                  <td className="py-1.5 text-right">
                    {ok ? <Check size={16} color={VERDICT.SEALED.c} /> : <XIcon size={16} color={VERDICT.BROKEN.c} />}
                    <span className="sr-only">{ok ? "Passed" : "Needs attention"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="text-sm space-y-1 list-disc pl-5">
          {s.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <div className="flex gap-3 rounded-xl p-3" style={{ backgroundColor: `${v.c}14` }}>
          <Bot size={18} className="shrink-0 mt-0.5" color={v.c} />
          <p className="text-sm leading-snug"><span className="font-bold">Themba: </span>{s.say}</p>
        </div>
        <p className="text-xs" style={{ color: SLATE }}>Illustrative example. Only your bank can confirm a payment.</p>
      </div>
    </div>
  );
}

const STEP_LABELS = ["Evidence received", "Reading the text", "Checking the chain", "Verifying signature"];

function LiveCheck({ onVerdict }: { onVerdict: (v: VerdictKey) => void }) {
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const hover = useRef(false);
  const s = SCENARIOS[i];

  useEffect(() => {
    if (prefersReducedMotion()) { setAuto(false); setStep(4); }
  }, []);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => { if (!hover.current && !document.hidden) setStep((p) => p + 1); }, 950);
    return () => clearInterval(id);
  }, [auto]);

  useEffect(() => {
    if (step === 4) onVerdict(s.verdict);
    if (step >= 11 && auto) { setStep(0); setI((p) => (p + 1) % SCENARIOS.length); }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (idx: number) => { setAuto(false); setI(idx); setStep(4); onVerdict(SCENARIOS[idx].verdict); };

  return (
    <div
      onMouseEnter={() => { hover.current = true; }}
      onMouseLeave={() => { hover.current = false; }}
      className="rounded-3xl bg-white/90 backdrop-blur border border-black/10 shadow-2xl p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="sk-ring absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: DEEP }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: DEEP }} />
        </span>
        <span className="text-sm font-bold">Live check</span>
        <span className="ml-auto text-xs" style={{ color: SLATE }}>Synthetic example</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4" role="group" aria-label="Example scenarios">
        {SCENARIOS.map((sc, idx) => (
          <button key={sc.id} type="button" onClick={() => pick(idx)} aria-pressed={idx === i}
            className="text-xs font-semibold px-3 py-2 rounded-full border transition-colors min-h-[36px]"
            style={idx === i
              ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
              : { borderColor: "rgba(20,23,63,.3)", color: NAVY }}>
            {sc.tab}
          </button>
        ))}
      </div>
      <div className="min-h-[29rem] sm:min-h-[27rem]" aria-live="polite">
        {step < 4 ? (
          <div className="space-y-4">
            <div className="relative h-44 rounded-2xl bg-[#F1F2FF] border border-black/5 overflow-hidden p-4">
              <p className="text-xs mb-3" style={{ color: SLATE }}>
                Message: <span className="font-semibold" style={{ color: NAVY }}>{s.chat}</span>
              </p>
              {[70, 92, 55, 80, 40].map((w, k) => (
                <div key={k} className="h-2 rounded bg-black/10 mb-2.5" style={{ width: `${w}%` }} />
              ))}
              <div className="sk-scan absolute left-0 right-0 h-10" style={{ background: `linear-gradient(to bottom, transparent, ${INDIGO}66, transparent)` }} />
            </div>
            <ul className="space-y-2">
              {STEP_LABELS.map((l, idx) => (
                <li key={l} className="flex items-center gap-3 text-sm transition-opacity duration-300" style={{ opacity: idx <= step ? 1 : 0.45 }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: idx < step ? DEEP : "rgba(20,23,63,.3)" }}>
                    {idx < step ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ) : <VerdictCard key={s.id} s={s} />}
      </div>
    </div>
  );
}

/* ─── Interactive product preview (fictional business) ───────── */
function ProductPreview() {
  const [sel, setSel] = useState(1);
  const [asked, setAsked] = useState(false);
  const [thinking, setThinking] = useState(false);
  const tm = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = TXNS[sel];
  const v = VERDICT[t.verdict];

  useEffect(() => () => { if (tm.current) clearTimeout(tm.current); }, []);

  const choose = (idx: number) => {
    if (tm.current) clearTimeout(tm.current);
    setSel(idx); setAsked(false); setThinking(false);
  };
  const ask = () => {
    setAsked(false); setThinking(true);
    if (tm.current) clearTimeout(tm.current);
    tm.current = setTimeout(() => { setThinking(false); setAsked(true); }, prefersReducedMotion() ? 0 : 900);
  };

  const journey = asked ? 3 : 2;
  const JOURNEY = ["Pick a record", "Inspect the evidence", "Ask Themba why"];

  return (
    <div className="rounded-3xl bg-white/90 backdrop-blur border border-black/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-3 border-b border-black/10" style={{ backgroundColor: NAVY, color: "#fff" }}>
        <Store size={18} color={LAV} />
        <p className="text-sm font-bold">Thandi’s Spaza <span className="font-medium text-[#C9CCFF]">· fictional demo business</span></p>
        <span className="sm:ml-auto text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ backgroundColor: "#FFF4DC", color: "#7A5600" }}>Illustrative data</span>
      </div>

      {/* Journey */}
      <ol className="flex flex-wrap gap-x-5 gap-y-1 px-4 sm:px-6 py-3 text-xs font-semibold border-b border-black/5 bg-white/80">
        {JOURNEY.map((j, idx) => (
          <li key={j} className="flex items-center gap-2" style={{ opacity: idx < journey ? 1 : 0.55 }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white" style={{ backgroundColor: idx < journey ? DEEP : "rgba(20,23,63,.4)" }}>{idx + 1}</span>
            {j}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <button type="button" onClick={() => scrollToId("integrations")} className="flex items-center gap-2 underline underline-offset-4 decoration-2" style={{ color: DEEP }}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white" style={{ backgroundColor: DEEP }}>4</span>
            See what integrations could add
          </button>
        </li>
      </ol>

      {/* KPIs */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10">
        {([["Recorded sales", "R18,420"], ["Recorded expenses", "R9,310"], ["Open flags", "2"], ["Records this week", "41"]] as [string, string][]).map(([k, val]) => (
          <div key={k} className="bg-white px-4 sm:px-6 py-3">
            <dt className="text-xs font-semibold" style={{ color: SLATE }}>{k}</dt>
            <dd className="text-xl sm:text-2xl font-black tracking-tight">{val}</dd>
          </div>
        ))}
      </dl>

      <div className="grid lg:grid-cols-[.9fr_1.1fr]">
        {/* Transaction list */}
        <div className="border-b lg:border-b-0 lg:border-r border-black/10">
          <p className="px-4 sm:px-6 pt-4 pb-2 text-xs font-bold uppercase tracking-wider" style={{ color: SLATE }}>This week’s records</p>
          <ul className="px-2 sm:px-3 pb-3" role="listbox" aria-label="Records">
            {TXNS.map((x, idx) => {
              const on = idx === sel;
              const xv = VERDICT[x.verdict];
              return (
                <li key={x.id} role="option" aria-selected={on}>
                  <button type="button" onClick={() => choose(idx)}
                    className="w-full flex items-center gap-3 text-left rounded-xl px-3 py-3 min-h-[56px] transition-colors"
                    style={on ? { backgroundColor: `${DEEP}14`, boxShadow: `inset 3px 0 0 ${DEEP}` } : undefined}>
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: xv.c }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold truncate">{x.title}</span>
                      <span className="block text-xs truncate" style={{ color: SLATE }}>{x.when} · {x.kind}</span>
                    </span>
                    <span className="text-sm font-bold whitespace-nowrap">{x.amount}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Evidence panel */}
        <div key={t.id} className="sk-fade p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black mr-1">{t.title}</h3>
            <Pill color="#fff" bg={v.c}>{v.label}</Pill>
            <Pill>{t.tier}</Pill>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: SLATE }}>Source · {t.source}</p>
            <p className="rounded-xl border border-dashed border-black/30 bg-[#F6F7FF] px-4 py-3 text-sm break-words">{t.raw}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: SLATE }}>Extracted fields</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {t.fields.map(([k, val]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs" style={{ color: SLATE }}>{k}</dt>
                  <dd className="font-semibold break-words">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: SLATE }}>Checks run by code</p>
            <ul className="space-y-1.5">
              {t.checks.map(([c, ok]) => (
                <li key={c} className="flex gap-2 text-sm">
                  {ok ? <Check size={16} className="mt-0.5 shrink-0" color={VERDICT.SEALED.c} /> : <XIcon size={16} className="mt-0.5 shrink-0" color={VERDICT.BROKEN.c} />}
                  <span><span className="sr-only">{ok ? "Passed: " : "Needs attention: "}</span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <button type="button" onClick={ask} disabled={thinking}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white min-h-[44px] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              style={{ backgroundColor: NAVY }}>
              <Bot size={16} color={LAV} /> Ask Themba why
            </button>
            <div className="mt-3 min-h-[5.5rem]" aria-live="polite">
              {thinking && (
                <div className="inline-flex rounded-2xl rounded-bl-sm bg-white border border-black/5 px-4 py-3 gap-1" aria-label="Themba is typing">
                  {[0, 1, 2].map((d) => <span key={d} className="sk-dot h-1.5 w-1.5 rounded-full bg-[#2F3463]" style={{ animationDelay: `${d * 0.18}s` }} />)}
                </div>
              )}
              {asked && (
                <div className="sk-pop flex gap-3 rounded-xl p-3" style={{ backgroundColor: `${DEEP}12` }}>
                  <Bot size={18} className="shrink-0 mt-0.5" color={DEEP} />
                  <p className="text-sm leading-snug"><span className="font-bold">Themba: </span>{t.say}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="px-4 sm:px-6 py-3 text-xs border-t border-black/10 bg-white/80" style={{ color: SLATE }}>
        Everything above is synthetic and for illustration. Figures are not real trading results.
      </p>
    </div>
  );
}

/* ─── Themba chat ────────────────────────────────────────────── */
function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setStarted(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || n >= CHAT.length) { setTyping(false); return; }
    if (prefersReducedMotion()) { setN(CHAT.length); return; }
    const isT = CHAT[n].from === "t";
    setTyping(isT);
    const id = setTimeout(() => { setTyping(false); setN((p) => p + 1); }, isT ? 1500 : 900);
    return () => clearTimeout(id);
  }, [started, n]);

  return (
    <div ref={ref} className="rounded-3xl bg-white border border-black/10 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3" style={{ backgroundColor: NAVY }}>
        <div className="h-8 w-8 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: INDIGO, color: "#fff" }}>T</div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Themba</p>
          <p className="text-xs text-[#C9CCFF]">Explains your records · illustrative chat</p>
        </div>
        <button type="button" onClick={() => { setN(0); setStarted(true); }}
          className="ml-auto text-xs font-semibold text-[#C9CCFF] hover:text-white transition-colors px-2 py-2">
          Replay
        </button>
      </div>
      <div className="p-3 sm:p-4 space-y-3 min-h-[24rem] bg-[#F1F2FF]" aria-live="polite">
        {CHAT.slice(0, n).map((m, idx) => (
          <div key={idx} className={`sk-pop flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
              m.from === "you" ? "text-white rounded-br-sm" : "bg-white border border-black/5 rounded-bl-sm"
            } ${m.draft ? "italic" : ""}`}
              style={m.from === "you" ? { backgroundColor: DEEP } : undefined}>
              {m.t}
              {m.draft && (
                <span className="block not-italic text-xs mt-2 font-semibold" style={{ color: SLATE }}>
                  Draft only. You review it before anything is sent.
                </span>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white border border-black/5 px-4 py-3 flex gap-1" aria-label="Themba is typing">
              {[0, 1, 2].map((d) => (
                <span key={d} className="sk-dot h-1.5 w-1.5 rounded-full bg-[#2F3463]" style={{ animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Integration Centre ─────────────────────────────────────── */
const WALK = ["The gap", "Import", "Validate", "Discrepancy"];

function IntegrationCentre() {
  const [conn, setConn] = useState(0);
  const [w, setW] = useState(0);
  const C = CONNECTIONS[conn];
  const CI = C.icon;

  return (
    <div className="space-y-10">
      {/* Standalone vs connected */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/90 border border-black/10 p-6">
          <Pill color="#fff" bg={VERDICT.SEALED.c}>Works today</Pill>
          <h3 className="text-xl font-black mt-3 mb-2">Standalone SCRIBE</h3>
          <p style={{ color: SLATE }}>Capture by voice, photo or manual entry. Sealed records, reconciliation and Themba explanations all work without connecting anything.</p>
        </div>
        <div className="rounded-2xl bg-white/85 border border-dashed border-black/30 p-6">
          <Pill color="#7A5600" bg="#FFF4DC">Proposed</Pill>
          <h3 className="text-xl font-black mt-3 mb-2">Connected SCRIBE</h3>
          <p style={{ color: SLATE }}>Integrations would add stronger evidence from outside your own entries. They make SCRIBE more powerful. They aren’t needed to use it.</p>
        </div>
      </div>

      {/* Connection picker */}
      <div className="rounded-3xl bg-white/90 backdrop-blur border border-black/10 shadow-xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plug size={18} color={DEEP} />
          <p className="font-bold">Integration Centre preview</p>
          <span className="ml-auto text-xs" style={{ color: SLATE }}>Nothing here is connected</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5" role="group" aria-label="Proposed connections">
          {CONNECTIONS.map((c, idx) => {
            const Icon = c.icon;
            const on = idx === conn;
            return (
              <button key={c.name} type="button" aria-pressed={on} onClick={() => setConn(idx)}
                className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold min-h-[48px] transition-colors"
                style={on ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY } : { borderColor: "rgba(20,23,63,.25)" }}>
                <Icon size={18} color={on ? LAV : DEEP} /> {c.name}
              </button>
            );
          })}
        </div>
        <div key={C.name} className="sk-fade flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-2xl bg-[#F6F7FF] p-4 sm:p-5">
          <CI size={28} color={DEEP} className="shrink-0" />
          <p className="flex-1">{C.adds}</p>
          <div className="flex flex-wrap gap-2">
            <Pill color="#7A5600" bg="#FFF4DC">{C.status}</Pill>
            <Pill>Evidence: {C.tier}</Pill>
          </div>
        </div>
      </div>

      {/* Walkthrough */}
      <div className="rounded-3xl bg-white/90 backdrop-blur border border-black/10 shadow-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2" style={{ backgroundColor: NAVY, color: "#fff" }}>
          <p className="font-bold text-sm">POS walkthrough</p>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ backgroundColor: "#FFF4DC", color: "#7A5600" }}>Synthetic POS export · not a live connection</span>
        </div>
        <ol className="grid grid-cols-4 border-b border-black/10 text-center">
          {WALK.map((l, idx) => (
            <li key={l}>
              <button type="button" onClick={() => setW(idx)} aria-current={idx === w ? "step" : undefined}
                className="w-full py-3 px-1 text-[11px] sm:text-xs font-bold min-h-[48px] transition-colors"
                style={{ color: idx === w ? DEEP : SLATE, boxShadow: idx === w ? `inset 0 -3px 0 ${DEEP}` : undefined, opacity: idx <= w ? 1 : 0.7 }}>
                <span className="block sm:inline sm:mr-1">{idx + 1}</span>{l}
              </button>
            </li>
          ))}
        </ol>

        <div key={w} className="sk-fade p-4 sm:p-6 min-h-[17rem]">
          {w === 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-black">Till takings and your records live apart</h3>
              <p style={{ color: SLATE }}>A shop has a till or POS system that counts what was rung up. SCRIBE holds what the owner recorded. Today nobody compares the two, so gaps go unnoticed.</p>
              <p style={{ color: SLATE }}>A POS export could give SCRIBE a second, independent source to check against.</p>
            </div>
          )}
          {w === 1 && (
            <div className="space-y-3">
              <h3 className="text-xl font-black">Import a synthetic POS export</h3>
              <p className="text-sm font-mono rounded-lg bg-[#F1F2FF] px-3 py-2 w-fit">pos_export_demo.csv</p>
              <div className="sk-scroll">
                <table className="w-full text-sm min-w-[22rem]">
                  <thead><tr className="text-left text-xs" style={{ color: SLATE }}><th className="pb-1 font-semibold">Item</th><th className="pb-1 font-semibold">Units sold (POS)</th></tr></thead>
                  <tbody>{POS_ROWS.map(([it, pos]) => <tr key={it} className="border-t border-black/5"><td className="py-1.5 font-semibold">{it}</td><td className="py-1.5">{pos}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
          {w === 2 && (
            <div className="space-y-3">
              <h3 className="text-xl font-black">Validate before anything is used</h3>
              <ul className="space-y-2 text-sm">
                {["Columns match the expected format", "All dates fall inside the week", "No duplicate rows", "3 of 3 rows parsed"].map((x) => (
                  <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" color={VERDICT.SEALED.c} />{x}</li>
                ))}
              </ul>
              <p className="text-sm" style={{ color: SLATE }}>Rows that fail are shown to you, not silently dropped.</p>
            </div>
          )}
          {w === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black">One gap stands out</h3>
              <div className="sk-scroll">
                <table className="w-full text-sm min-w-[22rem]">
                  <thead><tr className="text-left text-xs" style={{ color: SLATE }}><th className="pb-1 font-semibold">Item</th><th className="pb-1 font-semibold">POS</th><th className="pb-1 font-semibold">Your records</th><th className="pb-1 font-semibold">Difference</th></tr></thead>
                  <tbody>
                    {POS_ROWS.map(([it, pos, rec]) => {
                      const d = pos - rec;
                      return (
                        <tr key={it} className="border-t border-black/5">
                          <td className="py-1.5 font-semibold">{it}</td><td className="py-1.5">{pos}</td><td className="py-1.5">{rec}</td>
                          <td className="py-1.5 font-bold" style={{ color: d ? VERDICT.BROKEN.c : VERDICT.SEALED.c }}>{d ? `${d} unrecorded` : "Matches"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm"><span className="font-bold">Evidence: </span><span style={{ color: SLATE }}>3 bread sales appear in the POS export with no matching record in SCRIBE.</span></p>
              <div className="flex gap-3 rounded-xl p-3" style={{ backgroundColor: `${DEEP}12` }}>
                <Bot size={18} className="shrink-0 mt-0.5" color={DEEP} />
                <p className="text-sm leading-snug"><span className="font-bold">Themba: </span>Three bread sales were rung up on the till but never recorded. I can’t tell which side is correct. Add the missing records, or tell me why they don’t belong.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-black/10 bg-white/80">
          <button type="button" onClick={() => setW((p) => Math.max(0, p - 1))} disabled={w === 0}
            className="inline-flex items-center gap-2 text-sm font-bold px-3 py-2 min-h-[44px] rounded-lg disabled:opacity-30">
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" onClick={() => setW((p) => (p === WALK.length - 1 ? 0 : p + 1))}
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 min-h-[44px] rounded-xl text-white" style={{ backgroundColor: NAVY }}>
            {w === WALK.length - 1 ? "Restart" : "Next"} <ArrowRight size={16} color={LAV} />
          </button>
        </div>
      </div>

      {/* Roadmap */}
      <div>
        <h3 className="text-xl font-black mb-4">Roadmap</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {ROADMAP.map(([h, items, now]) => (
            <div key={h} className="rounded-2xl border p-5" style={now ? { backgroundColor: "rgba(255,255,255,.92)", borderColor: `${VERDICT.SEALED.c}66` } : { backgroundColor: "rgba(255,255,255,.8)", borderColor: "rgba(20,23,63,.2)", borderStyle: "dashed" }}>
              <p className="text-sm font-black mb-3" style={{ color: now ? VERDICT.SEALED.c : SLATE }}>{h}</p>
              <ul className="space-y-1.5 text-sm">
                {items.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: now ? VERDICT.SEALED.c : "rgba(20,23,63,.45)" }} />{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 sk-lede" style={{ color: SLATE }}>Roadmap items are plans, not commitments or live features.</p>
      </div>
    </div>
  );
}

/* ─── Channels + WhatsApp modal ──────────────────────────────── */
function WhatsAppModal({ onClose }: { onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    btn.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="sk-fade fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="wa-title">
      <button type="button" aria-label="Close dialog" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" style={{ backgroundColor: "rgba(20,23,63,.55)" }} />
      <div className="sk-pop relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90svh] overflow-y-auto">
        <button ref={btn} type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 h-11 w-11 flex items-center justify-center rounded-full hover:bg-black/5">
          <XIcon size={20} />
        </button>
        <Pill color="#7A5600" bg="#FFF4DC">COMING SOON</Pill>
        <h3 id="wa-title" className="text-2xl font-black mt-4 mb-1">SCRIBE on WhatsApp</h3>
        <p className="font-semibold mb-3" style={{ color: DEEP }}>Sorry, we’re still working on that!</p>
        <p className="mb-6" style={{ color: SLATE }}>
          We’re preparing a simpler way to capture business activity and check records directly from WhatsApp. For now, you can try SCRIBE on Telegram or use the web app.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white min-h-[48px]" style={{ backgroundColor: NAVY }}>
            <Send size={18} color={LAV} /> Try Telegram instead
          </a>
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 font-bold border border-black/15 min-h-[48px]">Close</button>
        </div>
        <p className="text-xs mt-4" style={{ color: SLATE }}>WhatsApp integration is planned, not yet available.</p>
      </div>
    </div>
  );
}

function Channels({ onWhatsApp }: { onWhatsApp: () => void }) {
  return (
    <div>
      <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Take SCRIBE wherever business happens.</h3>
      <p className="text-lg mb-8 sk-lede" style={{ color: SLATE }}>Choose how you want to interact with your business records.</p>
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-3xl bg-white/95 border border-black/10 shadow-lg p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: NAVY }}><Send size={22} color={LAV} /></div>
            <Pill color="#fff" bg={VERDICT.SEALED.c}>Available to try</Pill>
          </div>
          <h4 className="text-xl font-black mb-1">SCRIBE on Telegram</h4>
          <p className="mb-6 flex-1" style={{ color: SLATE }}>Check records, investigate documents and access your business assistant.</p>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white min-h-[48px] hover:-translate-y-0.5 transition-transform" style={{ backgroundColor: NAVY }}>
            Check the Telegram Bot <ArrowUpRight size={18} color={LAV} />
          </a>
        </div>
        <div className="rounded-3xl bg-white/85 border border-dashed border-black/30 p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-black/10"><MessageCircle size={22} color={NAVY} /></div>
            <Pill color="#7A5600" bg="#FFF4DC">Coming soon</Pill>
          </div>
          <h4 className="text-xl font-black mb-1">SCRIBE on WhatsApp</h4>
          <p className="mb-6 flex-1" style={{ color: SLATE }}>A simpler way to check business records, right from your chats.</p>
          <button type="button" onClick={onWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold border-2 min-h-[48px] hover:-translate-y-0.5 transition-transform" style={{ borderColor: NAVY }}>
            Preview WhatsApp Bot
          </button>
          <p className="text-xs mt-3 text-center" style={{ color: SLATE }}>Future integration preview · Not live yet</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Challenges + solution (bottom of page) ─────────────────── */
function ChallengesSection() {
  return (
    <section id="challenges" data-theme="light" className="py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
        <Reveal>
          <p className="inline-block text-xs font-black tracking-[0.2em] px-4 py-2 rounded-full mb-5 text-white" style={{ backgroundColor: NAVY }}>FNB APP OF THE YEAR · 2026</p>
          <h2 className="text-3xl md:text-6xl font-black tracking-tight max-w-4xl mb-5">Technology should create opportunity.</h2>
          <p className="sk-lede text-base md:text-xl max-w-3xl mb-10 md:mb-14" style={{ color: SLATE }}>
            SCRIBE Intelligence by Team CODE BLOODED is built around a simple idea: when people understand their money and their business better, they can make more informed decisions about what comes next.
          </p>
        </Reveal>

        <div className="space-y-6 md:space-y-8">
          {CHALLENGES.map((c, idx) => (
            <Reveal key={c.num} delay={idx * 100}>
              <div className="rounded-3xl bg-white/95 border border-black/10 shadow-xl overflow-hidden">
                <div className="px-6 md:px-10 py-4" style={{ backgroundColor: NAVY, color: "#fff" }}>
                  <p className="text-sm md:text-base font-black tracking-wide">Challenge {c.num} · <span className="text-[#C9CCFF]">{c.name}</span></p>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="p-6 md:p-10 md:border-r border-black/10">
                    <p className="text-xs font-black tracking-[0.2em] mb-3" style={{ color: VERDICT.BROKEN.c }}>THE PROBLEM</p>
                    <h3 className="text-xl md:text-2xl font-black leading-snug mb-4">{c.problemHead}</h3>
                    <p className="leading-relaxed text-base md:text-lg" style={{ color: SLATE }}>{c.problem}</p>
                  </div>
                  <div className="p-6 md:p-10 border-t md:border-t-0 border-black/10" style={{ backgroundColor: "#F3F4FF" }}>
                    <p className="text-xs font-black tracking-[0.2em] mb-3" style={{ color: DEEP }}>{c.respHead.toUpperCase()}</p>
                    <p className="leading-relaxed text-base md:text-lg mb-5">{c.resp}</p>
                    <ul className="flex flex-wrap gap-2">
                      {c.tags.map((tg) => (
                        <li key={tg}><span className="inline-block rounded-full px-3 py-1.5 text-sm font-bold text-white" style={{ backgroundColor: DEEP }}>{tg}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 md:mt-20">
          <Reveal>
            <p className="text-xs font-black tracking-[0.2em] mb-3" style={{ color: DEEP }}>OUR SOLUTION</p>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-5">From everyday records to informed decisions.</h3>
            <p className="sk-lede text-base md:text-lg max-w-3xl mb-8" style={{ color: SLATE }}>
              SCRIBE Intelligence helps small businesses turn fragmented records into structured, traceable information. Supported documents and transactions can be organised, available records compared, and potential inconsistencies brought forward for human review. Its business intelligence experience is designed to help users understand what their records show, what needs attention and what they can investigate next.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {SOLUTION.map(([h, d], idx) => (
              <Reveal key={h} delay={idx * 100}>
                <div className="h-full rounded-2xl bg-white/95 border border-black/10 shadow-lg p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full font-black mb-4" style={{ backgroundColor: NAVY, color: LAV }}>{idx + 1}</span>
                  <h4 className="text-xl font-black mb-2">{h}</h4>
                  <p className="leading-relaxed" style={{ color: SLATE }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <div className="mt-10 rounded-3xl p-8 md:p-12 text-center" style={{ backgroundColor: NAVY, color: "#fff" }}>
              <p className="text-2xl md:text-4xl font-black tracking-tight mb-3">Your business, understood.</p>
              <p className="text-base md:text-lg font-semibold" style={{ color: "#C9CCFF" }}>Better-organised records. Clearer business intelligence. More informed decisions.</p>
              <p className="mt-6 text-sm font-bold tracking-wide" style={{ color: LAV }}>SCRIBE Intelligence · Team CODE BLOODED</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ────────────────────────────────────────────────── */
function ContactSection() {
  return (
    <section id="contact" data-theme="light" className="py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-5 sm:px-6 md:px-12">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Get in touch.</h2>
          <p className="sk-lede text-base md:text-lg mb-8" style={{ color: SLATE }}>
            Questions about SCRIBE, the prototype, or the code? Reach Team CODE BLOODED directly.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          <a href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-2xl bg-white border border-black/10 shadow-lg p-6 hover:-translate-y-0.5 transition-transform min-h-[48px]">
            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: DEEP }}>Email</p>
            <p className="font-bold break-all">{CONTACT_EMAIL}</p>
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
            className="rounded-2xl bg-white border border-black/10 shadow-lg p-6 hover:-translate-y-0.5 transition-transform min-h-[48px]">
            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: DEEP }}>GitHub</p>
            <p className="font-bold break-all">github.com/vna-07/scribe-app</p>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA that works with or without a demo business ─────────── */
function DemoCTA({ demoBizId, className, style, children }: { demoBizId: string | null; className?: string; style?: CSSProperties; children: ReactNode }) {
  if (demoBizId) return <Link href={`/demo/${demoBizId}`} className={className} style={style}>{children}</Link>;
  return <button type="button" onClick={() => scrollToId("preview")} className={className} style={style}>{children}</button>;
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingClient({ demoBizId }: { demoBizId: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<string>("hero");
  const [heroVerdict, setHeroVerdict] = useState<VerdictKey>("SEALED");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [wa, setWa] = useState(false);
  const [word, setWord] = useState(0);
  const [moment, setMoment] = useState(0);
  const [faq, setFaq] = useState(0);

  const closeWa = useCallback(() => setWa(false), []);

  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rootRef.current?.style.setProperty("--mx", `${e.clientX}px`);
        rootRef.current?.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    const update = () => {
      ticking = false;
      const h = document.documentElement;
      const y = window.scrollY;
      const p = y / Math.max(1, h.scrollHeight - h.clientHeight);
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
      setScrolled(y > 24);
      const how = howRef.current;
      if (how && lineRef.current) {
        const r = how.getBoundingClientRect();
        const q = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
        lineRef.current.style.transform = `scaleY(${q})`;
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    if (fine) window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = document.querySelectorAll("[data-theme]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setTheme(e.target.getAttribute("data-theme") || "light"); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => { if (!document.hidden) setWord((w) => (w + 1) % ROTATING.length); }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    const mq = window.matchMedia("(min-width: 1280px)");
    const mqh = () => { if (mq.matches) setMenu(false); };
    window.addEventListener("keydown", key);
    mq.addEventListener("change", mqh);
    return () => { window.removeEventListener("keydown", key); mq.removeEventListener("change", mqh); };
  }, [menu]);

  const go = (id: string) => { setMenu(false); scrollToId(id); };

  const hv = VERDICT[heroVerdict];
  const t = theme === "hero"
    ? { bg: hv.tint, a: hv.tint, b: hv.blob, dot: "rgba(20,23,63,.08)" }
    : (THEMES[theme as ThemeKey] || THEMES.light);
  const dark = theme === "dark";
  const M = MOMENTS[moment];
  const navBg = scrolled || menu ? (dark ? "rgba(20,23,63,.94)" : "rgba(233,235,255,.94)") : "transparent";

  return (
    <div ref={rootRef} className={`sk-root relative min-h-screen font-sans selection:bg-[#14173F] selection:text-[#A9AEFF] ${dark ? "sk-dark" : ""}`} style={{ color: NAVY }}>
      <style>{CSS}</style>
      <Backdrop t={t} dark={dark} />
      <div ref={barRef} aria-hidden="true" className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left" style={{ backgroundColor: INDIGO, transform: "scaleX(0)" }} />

      {/* Always-visible competition tag */}
      <div className="fixed bottom-3 left-3 z-30 rounded-full px-3 py-1.5 text-[11px] font-black shadow-lg pointer-events-none max-w-[calc(100vw-1.5rem)] truncate"
        style={{ backgroundColor: NAVY, color: "#fff", border: `1px solid ${LAV}` }}>
        FNB App of the Year 2026 · Competition submission
      </div>

      {/* Nav */}
      <nav aria-label="Main"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled || menu ? "backdrop-blur-md py-3" : "py-4 md:py-6"}`}
        style={{ backgroundColor: navBg, color: dark ? "#E9EBFF" : NAVY }}>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 flex items-center justify-between gap-4">
          <button type="button" onClick={() => go("top")} className="flex items-center gap-3 min-h-[44px]" aria-label="SCRIBE home">
            <div className="w-8 h-8 sm:w-9 sm:h-9 grid grid-cols-2 gap-0.5 rotate-45" aria-hidden="true">
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: dark ? "#fff" : NAVY }} />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: INDIGO }} />
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: INDIGO }} />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: dark ? "#fff" : NAVY }} />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-[0.18em]">SCRIBE</span>
          </button>
          <div className="hidden xl:flex items-center gap-5 text-sm font-semibold">
            {NAV.map(([id, l]) => (
              <button key={id} type="button" onClick={() => go(id)} className="opacity-80 hover:opacity-100 transition-opacity py-2">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-sm font-bold flex items-center gap-2 group min-h-[44px] px-2">
              Sign in <ArrowRight size={16} className="hidden sm:block group-hover:translate-x-1 transition-transform" />
            </Link>
            <button type="button" className="xl:hidden h-11 w-11 flex items-center justify-center rounded-lg" aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
              {menu ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
        {menu && (
          <div id="mobile-menu" className="sk-fade xl:hidden max-w-[1400px] mx-auto px-5 sm:px-6 pt-3 pb-2 max-h-[calc(100svh-4.5rem)] overflow-y-auto">
            <div className="flex flex-col border-t border-current/10">
              {NAV.map(([id, l]) => (
                <button key={id} type="button" onClick={() => go(id)} className="text-left text-base font-semibold py-3.5 border-b border-current/10">{l}</button>
              ))}
              <Link href="/signup" onClick={() => setMenu(false)} className="mt-4 mb-2 text-center font-bold py-3.5 rounded-xl text-[#E9EBFF]" style={{ backgroundColor: dark ? INDIGO : NAVY }}>
                Create account
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        {/* 01 · HERO */}
        <header id="top" data-theme="hero" className="relative">
          <div aria-hidden="true" className="absolute top-40 left-[46%] h-14 w-14 rounded-2xl border-2 sk-float hidden md:block"
            style={{ borderColor: `${hv.c}66`, "--r": "12deg", transition: "border-color 1s" } as CSSProperties} />
          <div aria-hidden="true" className="absolute bottom-24 left-[6%] h-8 w-8 rounded-full sk-float hidden sm:block"
            style={{ backgroundColor: `${hv.c}33`, animationDelay: "-3s", transition: "background-color 1s" }} />

          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 pt-28 sm:pt-36 md:pt-44 pb-16 md:pb-24 grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-14 items-center">
            <div className="min-w-0">
              <SubmissionBadge />
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-6 md:mb-8" style={{ backgroundColor: NAVY, color: "#fff" }}>
                Financial intelligence for the informal economy
              </span>
              <h1 className="text-[2.75rem] leading-[1] sm:text-6xl xl:text-7xl font-black tracking-tighter mb-5 md:mb-6">
                Your business,<br />
                <span className="sk-shine">understood.</span>
              </h1>
              <p className="sk-lede text-lg sm:text-xl md:text-2xl font-semibold mb-5 min-h-[4.25rem] sm:min-h-[3.25rem] md:min-h-[2.25rem]" style={{ color: DEEP }}>
                Making every record provable when{" "}
                <span key={word} className="sk-pop inline-block sk-shine">{ROTATING[word]}</span>
              </p>
              <p className="sk-lede text-base sm:text-lg max-w-xl leading-relaxed mb-8 md:mb-10 font-medium" style={{ color: SLATE }}>
                Turn everyday sales, expenses, stock records and documents into financial intelligence: what the evidence supports, what doesn’t reconcile, and what to do next. Sealed, signed and explained in plain language.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <DemoCTA demoBizId={demoBizId}
                  className="font-bold py-4 px-8 rounded-xl text-lg text-[#E9EBFF] flex items-center justify-center gap-3 group hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 min-h-[56px]"
                  style={{ backgroundColor: NAVY }}>
                  Explore the demo
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </DemoCTA>
                <Link href="/signup"
                  className="bg-white font-bold py-4 px-8 rounded-xl text-lg border-2 border-white/40 hover:border-[#5B5BE0] hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 min-h-[56px]"
                  style={{ color: NAVY }}>
                  Create account
                </Link>
              </div>
              <p className="sk-lede mt-6 text-sm font-medium" style={{ color: SLATE }}>
                Prefer chat?{" "}
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-4" style={{ color: DEEP }}>
                  Try SCRIBE on Telegram
                </a>
              </p>
            </div>
            <div className="min-w-0"><Tilt max={4}><LiveCheck onVerdict={setHeroVerdict} /></Tilt></div>
          </div>
        </header>

        {/* Marquee */}
        <div aria-hidden="true" className="border-y border-black/10 bg-white/70 backdrop-blur overflow-hidden py-4">
          <div className="sk-marquee flex w-max gap-10 whitespace-nowrap text-sm font-semibold">
            {(() => {
              const items = ["Cash sales forgotten", "Stock variances", "Missing receipts", "Edited records", "No lender proof", "Fragmented WhatsApp records", "Duplicate entries", "Broken hash chain", "Cash on hand vs reported"];
              return [...items, ...items].map((x, idx) => (
                <span key={idx} className="flex items-center gap-10" style={{ color: SLATE }}>
                  {x}<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INDIGO }} />
                </span>
              ));
            })()}
          </div>
        </div>

        {/* COMPETITION SUBMISSION */}
        <SubmissionBanner />

        {/* PILLARS */}
        <section data-theme="light" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-10 md:mb-14">Records. Evidence. Intelligence.</h2></Reveal>
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {([
                [FileText, "Records", "Every transaction captured by voice, photo, CSV or manual entry, and structured into a fixed format before it is sealed."],
                [Shield,   "Evidence", "Hash-chained and Ed25519-signed. A seal shows a record wasn’t altered, not that the sale happened. We say so plainly."],
                [Bot,      "Intelligence", "Themba explains results using your actual records, not industry averages. Code computes. Themba explains."],
              ] as [IconC, string, string][]).map(([Icon, h, d], idx) => (
                <Reveal key={h} delay={idx * 120}>
                  <Tilt className="h-full border-t-2 pt-6" max={5}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: NAVY, color: LAV }}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{h}</h3>
                    <p className="leading-relaxed" style={{ color: SLATE }}>{d}</p>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 02 · INTERACTIVE PRODUCT PREVIEW */}
        <section id="preview" data-theme="light" className="pb-16 md:pb-24">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-4">Explore a business. Inspect the evidence.</h2>
              <p className="sk-lede text-base md:text-lg max-w-2xl mb-8 md:mb-10" style={{ color: SLATE }}>
                Meet a fictional spaza shop. Pick a record, see the evidence behind it, and ask Themba why it looks the way it does.
              </p>
            </Reveal>
            <Reveal delay={100}><ProductPreview /></Reveal>
          </div>
        </section>

        {/* WHERE RECORDS BREAK */}
        <section id="moments" data-theme="warm" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-4">Records break at four predictable moments.</h2></Reveal>
            <Reveal delay={100}><p className="sk-lede text-base md:text-lg max-w-2xl mb-8 md:mb-12" style={{ color: SLATE }}>Pick one to see how records fall apart, and how SCRIBE is designed to put them back together.</p></Reveal>
            <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-6 md:gap-8 items-start">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible sk-scroll pb-1 -mx-5 px-5 sm:mx-0 sm:px-0" role="group" aria-label="Moments where records break">
                {MOMENTS.map((m, idx) => {
                  const Icon = m.icon;
                  const on = idx === moment;
                  return (
                    <button key={m.title} type="button" aria-pressed={on} onClick={() => setMoment(idx)}
                      className="flex items-center gap-3 md:gap-4 text-left rounded-2xl px-4 md:px-5 py-3.5 md:py-4 border transition-all duration-300 lg:hover:translate-x-1 shrink-0 lg:shrink min-h-[52px]"
                      style={on
                        ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                        : { backgroundColor: "rgba(255,255,255,.88)", borderColor: "rgba(20,23,63,.15)" }}>
                      <Icon size={22} color={on ? LAV : DEEP} className="shrink-0" />
                      <span className="font-bold whitespace-nowrap lg:whitespace-normal">{m.title}</span>
                    </button>
                  );
                })}
              </div>
              <div key={moment} className="sk-pop rounded-3xl bg-white/95 backdrop-blur border border-black/10 shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-6 md:gap-8" aria-live="polite">
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: VERDICT.BROKEN.c }}>Where it breaks</p>
                  <p className="text-base md:text-lg leading-relaxed">{M.scam}</p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: DEEP }}>How SCRIBE repairs it</p>
                  <p className="text-base md:text-lg leading-relaxed">{M.help}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03 · HOW SCRIBE WORKS */}
        <section id="how" data-theme="mint" className="py-16 md:py-24">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Capture. Structure. Reconcile. Explain. Verify.</h2></Reveal>
            <Reveal delay={100}><p className="sk-lede text-base md:text-lg mb-10 md:mb-14 max-w-2xl" style={{ color: SLATE }}>Everything that decides is a fixed rule you can test. The AI only explains.</p></Reveal>
            <div ref={howRef} className="relative pl-11 md:pl-16">
              <div className="absolute left-[15px] md:left-[23px] top-2 bottom-2 w-0.5 bg-black/10" />
              <div ref={lineRef} className="absolute left-[15px] md:left-[23px] top-2 bottom-2 w-0.5 origin-top" style={{ backgroundColor: DEEP, transform: "scaleY(0)" }} />
              <ol className="space-y-9 md:space-y-10">
                {STEPS.map((s, idx) => (
                  <li key={s.h}>
                    <Reveal delay={60}>
                      <div className="relative">
                        <span className="absolute -left-11 md:-left-16 top-0 h-8 w-8 md:h-12 md:w-12 rounded-full flex items-center justify-center font-black text-sm md:text-lg" style={{ backgroundColor: NAVY, color: LAV }}>
                          {idx + 1}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                          <h3 className="text-xl md:text-2xl font-bold">{s.h}</h3>
                          <Pill color={DEEP} bg="rgba(75,79,201,.14)">{s.tag}</Pill>
                        </div>
                        <p className="sk-lede text-base md:text-lg max-w-xl" style={{ color: SLATE }}>{s.d}</p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
            <Reveal delay={100}>
              <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/95 border border-black/10 p-5 md:p-6">
                  <p className="text-sm font-black mb-3" style={{ color: VERDICT.SEALED.c }}>What a sealed record shows</p>
                  <ul className="space-y-2 text-sm md:text-base">
                    {["It hasn’t changed since it was saved.", "Its numbers were calculated by code, not by AI.", "Which evidence tier it sits in."].map((x) => (
                      <li key={x} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0" color={VERDICT.SEALED.c} />{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white/85 border border-dashed border-black/30 p-5 md:p-6">
                  <p className="text-sm font-black mb-3" style={{ color: VERDICT.BROKEN.c }}>What it does not show</p>
                  <ul className="space-y-2 text-sm md:text-base">
                    {["That the sale or expense really happened.", "That a payment arrived or a loan will be approved.", "That a business is creditworthy."].map((x) => (
                      <li key={x} className="flex gap-2"><XIcon size={18} className="mt-0.5 shrink-0" color={VERDICT.BROKEN.c} />{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 04 · INTEGRATION CENTRE + CHANNELS */}
        <section id="integrations" data-theme="mint" className="pb-16 md:pb-24">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-4">SCRIBE works on its own. Connections make it stronger.</h2>
              <p className="sk-lede text-base md:text-lg max-w-2xl mb-10 md:mb-12" style={{ color: SLATE }}>
                A preview of the proposed POS, payments, supplier and accounting connections, shown with synthetic data. Nothing here is connected yet.
              </p>
            </Reveal>
            <Reveal><IntegrationCentre /></Reveal>
            <div className="mt-16 md:mt-20"><Reveal><Channels onWhatsApp={() => setWa(true)} /></Reveal></div>
          </div>
        </section>

        {/* THEMBA */}
        <section id="themba" data-theme="light" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Themba turns a number into a plan.</h2>
              <p className="sk-lede text-base md:text-lg leading-relaxed mb-8" style={{ color: SLATE }}>SCRIBE computes the numbers. Themba explains what they mean, in plain language, grounded in your actual records.</p>
              <ul className="space-y-4">
                {[
                  "Explains which records drove the number.",
                  "Drafts replies and summaries. You approve before anything is sent.",
                  "Keeps a task list open until you confirm each step.",
                  "Points to recovery steps when something has gone wrong.",
                  "Does not claim a loan was approved or a payment arrived. The bank has the final word.",
                ].map((x) => (
                  <li key={x} className="flex gap-3 text-base md:text-lg">
                    <Check size={22} className="shrink-0 mt-1" color={DEEP} />{x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}><ChatDemo /></Reveal>
          </div>
        </section>

        {/* IMPACT */}
        <section id="impact" data-theme="warm" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-4">Built for money confidence and work readiness.</h2>
              <p className="sk-lede text-base md:text-lg max-w-2xl mb-10 md:mb-12" style={{ color: SLATE }}>
                People who earn irregularly run real businesses, but leave records nobody can check. SCRIBE turns that activity into evidence they can use. Each point shows whether it exists today.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-5 md:gap-8">
              {IMPACT.map((col, idx) => {
                const Icon = col.icon;
                return (
                  <Reveal key={col.head} delay={idx * 120}>
                    <div className="h-full rounded-3xl bg-white/95 backdrop-blur border border-black/10 shadow-lg p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: NAVY }}><Icon size={22} color={LAV} /></div>
                        <h3 className="text-xl md:text-2xl font-black">{col.head}</h3>
                      </div>
                      <p className="mb-5" style={{ color: SLATE }}>{col.sub}</p>
                      <ul className="space-y-3">
                        {col.points.map(([p, st, live]) => (
                          <li key={p} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-sm md:text-base">
                            <span className="flex-1">{p}</span>
                            <span className="shrink-0"><Pill color={live ? "#fff" : "#7A5600"} bg={live ? VERDICT.SEALED.c : "#FFF4DC"}>{st}</Pill></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* DESIGN FACTS */}
        <section data-theme="light" className="pt-16 md:pt-20 pb-6">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 border-y border-black/10">
            {STATS.map(([n, suf, l], idx) => (
              <div key={l} className={`py-8 md:py-10 px-3 md:px-8 ${idx % 2 === 1 ? "border-l border-black/10" : ""} ${idx > 1 ? "border-t md:border-t-0 border-black/10" : ""} ${idx > 0 ? "md:border-l" : ""}`}>
                <p className="text-4xl md:text-6xl font-black tracking-tighter" style={{ color: DEEP }}>
                  <CountUp to={n} suffix={suf} />
                </p>
                <p className="mt-2 text-sm md:text-base font-semibold" style={{ color: SLATE }}>{l}</p>
              </div>
            ))}
          </div>
          <p className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 pt-3 text-xs" style={{ color: SLATE }}>
            These are design properties of the prototype, not measured results.
          </p>
        </section>

        {/* TRUST */}
        <section id="trust" data-theme="light" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-10 md:mb-14">Trust is not assumed. It is checked, and the limits are stated.</h2></Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12">
              {TRUST.map(([Icon, h, d], idx) => (
                <Reveal key={h} delay={(idx % 3) * 100}>
                  <div className="border-t border-black/20 py-6 md:py-7 group">
                    <Icon size={24} color={DEEP} className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <h3 className="text-lg font-bold mb-1">{h}</h3>
                    <p style={{ color: SLATE }}>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 05 · MEET CODE BLOODED */}
        <section id="team" data-theme="dark" className="py-16 md:py-24" style={{ color: "#F2F3FF" }}>
          <div className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal>
              <div className="mb-10 md:mb-14">
                <p className="text-xs font-semibold border px-4 py-2 rounded-full w-fit mb-5" style={{ color: "#D5D8FF", borderColor: "rgba(169,174,255,.5)" }}>Team CODE BLOODED</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Built by CODE BLOODED</h2>
                <p className="text-lg max-w-xl" style={{ color: "#D5D8FF" }}>Three founders. One mission: make business intelligence more accessible.</p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {TEAM.map((m, idx) => (
                <Reveal key={m.name} delay={idx * 90}>
                  <Tilt max={6} className="h-full">
                    <div className="border border-white/10 rounded-2xl p-6 md:p-8 hover:border-[#A9AEFF]/60 transition-colors duration-300 group h-full flex flex-col" style={{ backgroundColor: "#0E1130" }}>
                      <div
                        className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-xl font-black mb-6 transition-all duration-300 group-hover:scale-110 group-hover:!bg-[#A9AEFF] group-hover:!text-[#14173F]"
                        style={{ backgroundColor: NAVY, color: LAV }}>
                        {m.initials}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                      <p className="text-sm font-semibold mb-4" style={{ color: LAV }}>{m.role}</p>
                      <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "#D5D8FF" }}>{m.desc}</p>
                      <p className="text-sm font-semibold pt-4 border-t border-white/10"><span style={{ color: LAV }}>Focus: </span>{m.focus}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" data-theme="light" className="py-16 md:py-24">
          <div className="max-w-[900px] mx-auto px-5 sm:px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight mb-8 md:mb-10">Questions we expect.</h2></Reveal>
            <div className="border-t border-black/20 bg-white/80 rounded-2xl px-4 md:px-6">
              {FAQ.map(([q, a], idx) => {
                const open = faq === idx;
                return (
                  <div key={q} className="border-b border-black/15 last:border-b-0">
                    <h3>
                      <button type="button" aria-expanded={open} aria-controls={`faq-${idx}`} onClick={() => setFaq(open ? -1 : idx)}
                        className="w-full flex items-center justify-between gap-4 md:gap-6 py-5 text-left min-h-[56px]">
                        <span className="text-base md:text-lg font-bold">{q}</span>
                        <ChevronDown size={22} className="shrink-0 transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "none" }} />
                      </button>
                    </h3>
                    <div id={`faq-${idx}`} role="region" style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .35s ease" }}>
                      <div className="overflow-hidden"><p className="pb-5 text-base md:text-lg leading-relaxed" style={{ color: SLATE }}>{a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CHALLENGES + SOLUTION */}
        <ChallengesSection />

        {/* CONTACT */}
        <ContactSection />

        {/* FOOTER */}
        <footer data-theme="dark" className="py-16 md:py-20 px-5 text-center" style={{ color: "#F2F3FF" }}>
          <div className="flex justify-center items-center gap-3 mb-5">
            <div className="w-8 h-8 grid grid-cols-2 gap-0.5 rotate-45" aria-hidden="true">
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: LAV }} />
              <div className="rounded-tr-full rounded-br-full bg-white" />
              <div className="rounded-tl-full rounded-bl-full bg-white" />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: LAV }} />
            </div>
            <span className="text-xl font-black tracking-[0.18em]">SCRIBE</span>
          </div>
          <p className="mb-2 font-medium" style={{ color: "#D5D8FF" }}>Your business, understood.</p>
          <p className="mb-8 font-medium" style={{ color: "#D5D8FF" }}>Build records. Prove them.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-sm sm:max-w-none mx-auto">
            <DemoCTA demoBizId={demoBizId}
              className="font-bold py-3.5 px-8 rounded-xl hover:bg-white hover:!text-[#14173F] transition-colors inline-flex items-center justify-center gap-2 shadow-lg min-h-[48px]"
              style={{ backgroundColor: INDIGO, color: "#fff" }}>
              Explore the demo <ArrowUpRight size={18} />
            </DemoCTA>
            <Link href="/signup" className="font-bold py-3.5 px-8 rounded-xl border border-white/40 hover:bg-white/10 transition-colors inline-flex items-center justify-center min-h-[48px]">
              Create account
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold" style={{ color: "#D5D8FF" }}>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="py-2 hover:text-white">Telegram bot</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="py-2 hover:text-white">Email us</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="py-2 hover:text-white">GitHub</a>
            <button type="button" onClick={() => setWa(true)} className="py-2 hover:text-white">WhatsApp (coming soon)</button>
            <Link href="/login" className="py-2 hover:text-white">Sign in</Link>
          </div>
          <p className="mt-8 text-xs max-w-xl mx-auto pb-8" style={{ color: "rgba(213,216,255,.92)" }}>
            Competition submission: FNB App of the Year 2026. Prototype build by Team CODE BLOODED. Synthetic data only. Legal and privacy positions are provisional. WhatsApp and POS integrations are planned and not yet available.
          </p>
        </footer>
      </main>

      {wa && <WhatsAppModal onClose={closeWa} />}
    </div>
  );
}