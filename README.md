<div align="center">

<img src="docs/assets/hero-banner.svg" alt="SCRIBE Intelligence: Real Records. Greater Opportunities." width="100%"/>

<br/>

**A financial intelligence and business-operations platform for South African informal traders, spaza shops and micro-enterprises.**

SCRIBE turns fragmented business records into structured, tamper-evident financial information, then helps owners understand what the evidence supports, what doesn't reconcile, and what still needs to be verified.

<br/>

[![Live app](https://img.shields.io/badge/Live%20app-scribe--app--xi.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://scribe-app-xi.vercel.app)
[![Source](https://img.shields.io/badge/Source-vna--07%2Fscribe--app-0f172a?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vna-07/scribe-app)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)
![Turso](https://img.shields.io/badge/Turso-libSQL-4ff8d2?logo=turso&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini%20%2B%20Groq-8e75b2?logo=googlegemini&logoColor=white)
![Version](https://img.shields.io/badge/Version-0.9.0-6366f1)
![Track](https://img.shields.io/badge/Track-Youth%20Entrepreneurship%20%26%20Small--Business%20Growth-16a34a)
![Status](https://img.shields.io/badge/Status-Working%20MVP-f59e0b)

**[At a glance](#at-a-glance)** · **[Try it](#try-scribe)** · **[Demo scripts](#demo-scripts-60-seconds-each)** · **[Problem](#the-problem)** · **[Solution](#the-solution)** · **[Features](#what-works-today)** · **[Ledger](#data-integrity-the-tamper-evident-ledger)** · **[Themba](#themba-the-business-copilot)** · **[Architecture](#architecture)** · **[Evidence](#testing-and-validation)** · **[Cost](#running-cost)** · **[Roadmap](#roadmap)** · **[Setup](#setup-and-environment)** · **[Contact](#team-and-contact)**

</div>

---

## At a glance

| | |
|---|---|
| **What it is** | A financial intelligence layer for small businesses: capture records, seal them, reconcile stock and cash, explain what the numbers mean, and plan the next move. |
| **Who it is for** | Informal traders, spaza shops and micro-enterprises, plus the lenders and support programmes that need to understand them. |
| **Name** | **S**mall-business **C**larity, **R**ecords, **I**ntelligence, and **B**usiness **E**nablement. |
| **Core idea** | *A business should not need perfect records before it can begin improving them.* |
| **Design principle** | *AI reads, code decides, the trader confirms, the ledger remembers.* |
| **Built for** | FNB App of the Year Hackathon 2026, Youth Entrepreneurship & Small-Business Growth track. |
| **Version** | 0.9.0 (see [Version history](#version-history)) |
| **Status** | Working MVP, live and deployed, running on a real (anonymised) spaza shop dataset. Not a finished product, and this README says where the limits are. |

> *Most tools record what a business says happened. SCRIBE shows what the evidence supports, what doesn't reconcile, and what still needs to be verified.*

---

## Table of contents

1. [Try SCRIBE](#try-scribe)
2. [Demo scripts (60 seconds each)](#demo-scripts-60-seconds-each)
3. [Screenshots](#screenshots)
4. [The problem](#the-problem)
5. [Why this track](#why-this-track)
6. [The solution](#the-solution)
7. [What makes SCRIBE different](#what-makes-scribe-different)
8. [What works today](#what-works-today)
9. [Data integrity: the tamper-evident ledger](#data-integrity-the-tamper-evident-ledger)
10. [Reconciliation and the financial engine](#reconciliation-and-the-financial-engine)
11. [Themba's recommendation engine](#thembas-recommendation-engine)
12. [Themba, the business copilot](#themba-the-business-copilot)
13. [Document intelligence and voice capture](#document-intelligence-and-voice-capture)
14. [Business Launch Studio and Growth Studio](#business-launch-studio-and-growth-studio)
15. [Architecture](#architecture)
16. [Data model](#data-model)
17. [Security and privacy](#security-and-privacy)
18. [Testing and validation](#testing-and-validation)
19. [Running cost](#running-cost)
20. [Development story and real-world engagement](#development-story-and-real-world-engagement)
21. [Impact, limitations and responsible AI](#impact-limitations-and-responsible-ai)
22. [Roadmap](#roadmap)
23. [Setup and environment](#setup-and-environment)
24. [Browser support](#browser-support)
25. [Deployment and rollback](#deployment-and-rollback)
26. [API reference](#api-reference)
27. [Version history](#version-history)
28. [Troubleshooting](#troubleshooting)
29. [FAQ for reviewers](#faq-for-reviewers)
30. [Team and contact](#team-and-contact)

---

## Try SCRIBE

**Live application:** [https://scribe-app-xi.vercel.app](https://scribe-app-xi.vercel.app)

The app opens onto a pre-seeded demo business built from real, anonymised spaza shop records. If you want a guided login or a walkthrough, [contact the team](#team-and-contact).

**Demo login** (case-sensitive): `demo@scribe.co.za` / `DemoTrader2026!`
If login fails, see [Troubleshooting](#troubleshooting).

<details>
<summary><b>A 3-minute tour for reviewers</b></summary>

<br/>

| Minute | Where to look | What to notice |
|---|---|---|
| **0:00** | Dashboard | Revenue shown as a **range** tied to evidence quality, not a single confident number. A Consistency Score with its components. A data-completeness indicator. |
| **0:45** | Intelligence | **Themba's Recommendations**: deterministic, evidence-backed, with severity badges. |
| **1:15** | Stock | Per-product reconciliation. One seeded variance (Albany Bread, −8 units) is flagged with the expected versus counted figures. |
| **1:30** | Themba | Ask *"Why is my bread stock off?"* Every figure comes from the deterministic engine. Ask for a loan decision and watch it refuse. |
| **1:50** | Judge Mode | Click **Try to Cheat** and watch the hash chain break, then **Restore**. |
| **2:15** | Import and Voice | Upload a CSV or photo, or speak a transaction. Nothing is saved until you review and confirm. |
| **2:40** | Reports and Verify | Open the printable A4 statement with hash and QR code, then the public verification page. |

</details>

---

## Demo scripts (60 seconds each)

Click-by-click maps to the features a judge is most likely to miss.

<details>
<summary><b>🎯 Show the recommendation engine (the signature feature)</b></summary>

<br/>

1. Click **Intelligence** in the sidebar.
2. Scroll past the chart and donut.
3. Look for **"Themba's Recommendations · 5 items"**.
4. Notice the severity badges: 🔴 Action, 🔵 Monitor, 🟡 Variance.
5. Expand any card with **Show evidence** to see the exact numbers.
6. Click **Investigate** on a card to save it as a Growth Studio task.
7. When nothing is flagged, the dashboard shows a quiet green state. This is deliberately honest.

**What this proves:** every recommendation is computed deterministically from real records, with evidence, impact, downside and confidence labels. Not LLM-generated.

</details>

<details>
<summary><b>🔐 Show the cryptographic tamper detection</b></summary>

<br/>

1. On the dashboard, scroll to the **Judge Mode** section.
2. Click **Try to Cheat**.
3. The header badge turns red: *"Chain broken at record #2"*.
4. A red forensic banner appears.
5. The tampered record is highlighted with a struck-through hash.
6. Every subsequent record is faded, because the chain is invalid.
7. Click **Restore** in the red banner.
8. A green toast appears: *"Restored 21,093 records and 15,045 stock movements"*.
9. The chain is green again.

**What this proves:** the hash chain and Ed25519 signatures are real, and recovery is instant.

</details>

<details>
<summary><b>🎤 Show voice capture</b></summary>

<br/>

1. Click the **Voice** button in the dashboard header.
2. Tap the large microphone button.
3. Say: *"I bought 12 bottles of cooking oil for 240 rand"*.
4. The transcript appears live with a real waveform (not a fake animation).
5. Click **Review transaction →**.
6. See the extracted fields: Type = Expense, Amount = 240.00, Quantity = 12.
7. Notice the **stock-impact preview** if a matching product exists.
8. Confirm to seal the record.

**Try the ambiguous cases:** *"I bought oil for 240 and sold it for 300"* → the parser refuses. *"I bought 12 bottles for R24 each"* → it multiplies correctly.

**What this proves:** a real pipeline, a deterministic parser and honest failure modes.

</details>

<details>
<summary><b>🧠 Show Themba's refusals</b></summary>

<br/>

1. Click **Ask Themba** in the dashboard header.
2. Ask: *"Will I get a loan?"* → it refuses and offers an honest alternative.
3. Ask: *"Was I robbed?"* → it refuses to accuse anyone.
4. Ask: *"Should I invest in stocks?"* → it refuses regulated advice.
5. Ask: *"Why is my bread stock short?"* → it answers from the deterministic engine, cites records and offers an approval card.

**What this proves:** pre-flight safety gates, grounded answers and consent before action.

</details>

<details>
<summary><b>💳 Show the public verification page</b></summary>

<br/>

1. From any dashboard, click **Share** or open the printable statement.
2. Copy the QR code URL, or visit:
   `https://scribe-app-xi.vercel.app/verify/851ffbcf-8694-4194-8df6-7ed51846dc96`
3. No login is required.
4. The page shows:
   - ✓ Chain integrity status
   - Business identity
   - Documented readiness range
   - A **"What this proves" / "What this does NOT prove"** section
   - Evidence mix (reported / document-supported / counter-signed)

**What this proves:** a lender can independently verify the record without an account, and the page is honest about what the seal does not prove.

</details>

---

## Screenshots

<!--
  Add real screenshots to docs/screenshots/ using these file names.
  Use the live demo workspace (anonymised data only).
-->

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/dashboard.png" alt="Dashboard with revenue range, consistency score and completeness"/><br/><sub><b>Dashboard.</b> Revenue range, Consistency Score, data completeness.</sub></td>
    <td width="50%"><img src="docs/screenshots/stock-reconciliation.png" alt="Per-product stock reconciliation with a flagged variance"/><br/><sub><b>Stock reconciliation.</b> Expected versus counted, per product.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/themba.png" alt="Themba answering a question with grounded figures"/><br/><sub><b>Themba.</b> Grounded answers and approval cards.</sub></td>
    <td width="50%"><img src="docs/screenshots/import-review.png" alt="Import review screen with extracted fields to confirm"/><br/><sub><b>Review-first import.</b> Confirm before anything is saved.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/verify-page.png" alt="Public ledger verification page"/><br/><sub><b>Public verification.</b> No login needed for a lender to check integrity.</sub></td>
    <td width="50%"><img src="docs/screenshots/financial-statement.png" alt="Printable A4 financial statement with hash and QR code"/><br/><sub><b>Financial statement.</b> Printable, hashed, with QR code.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/judge-mode.png" alt="Judge Mode showing a broken hash chain and forensic banner"/><br/><sub><b>Judge Mode.</b> Tamper detection and instant restore.</sub></td>
    <td width="50%"><img src="docs/screenshots/voice-capture.png" alt="Voice capture with live transcript and waveform"/><br/><sub><b>Voice capture.</b> Live transcript, review before sealing.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/launch-studio.png" alt="Business Launch Studio reinvestment simulator"/><br/><sub><b>Launch Studio.</b> Reinvestment simulator and funding directory.</sub></td>
    <td width="50%"><img src="docs/screenshots/mobile.png" alt="Mobile layout with glassmorphic bottom navigation"/><br/><sub><b>Mobile first.</b> Installable PWA with bottom navigation.</sub></td>
  </tr>
</table>

---

## The problem

A small business can trade every day and still struggle to explain how well it is performing.

Sales sit in handwritten notebooks. Supplier purchases exist only as receipts in a drawer. Stock is tracked informally, and cash moves through several hands and several records. The activity is real. What is missing is a way to **reconstruct, reconcile, explain and substantiate** it.

| Context | Figure |
|---|---|
| Official unemployment (Q2 2026) | **33.6%** |
| Youth unemployment | **47.4%** |
| Non-VAT-registered business owners | **1.9 million** |
| Share of employment in the informal sector | roughly **19.5%** |

*Figures are the labour-market statistics the team compiled from Statistics South Africa releases. Check them against the latest release before relying on them elsewhere.*

```mermaid
flowchart LR
    subgraph Today["Today: scattered evidence"]
        A["Handwritten sales notebook"]
        B["Supplier receipts in a drawer"]
        C["Informal stock counts"]
        D["Cash and mobile money"]
    end
    A --> Q{{"How profitable am I really?<br/>Why is stock short?<br/>Can I prove this to a lender?"}}
    B --> Q
    C --> Q
    D --> Q
    Q --> R["Guesswork, missed growth,<br/>weak funding applications"]
    style Q fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style R fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
```

A spaza owner knows roughly what is in the till, but cannot reliably explain the gap between expected and actual stock. They may have strong sales and still lack the documented history that shows a lender, an investor or a support programme what the business can do.

**The gap SCRIBE addresses is the distance between running a business and being able to understand, demonstrate and finance its growth.**

The problem is not that these businesses are unprofitable. It is that their financial activity is hard to reconstruct, explain and prove.

---

## Why this track

We chose **Youth Entrepreneurship and Small-Business Growth** because technology should help existing businesses become more capable of growing, not only help people discover new ideas.

South Africa has people building businesses with limited resources, informal systems and real determination. Many need practical tools to understand their operations, make informed financial decisions and reach opportunities that could help them expand.

Rather than assume every business can adopt expensive accounting software or maintain complex books, SCRIBE starts with **the information a business already has**, structures it, and helps the owner build a clearer picture over time. That matches the challenge of helping young founders and township or rural businesses manage operations, improve funding readiness and reach wider markets.

---

## The solution

<div align="center">
<img src="docs/assets/user-journey.svg" alt="Animated pipeline: capture, extract, review, reconcile, seal, understand, grow" width="100%"/>
</div>

<br/>

SCRIBE connects the whole journey from an everyday record to an actionable result.

| Step | What happens | Why it matters |
|---|---|---|
| **1. Capture** | The owner photographs a receipt, uploads a CSV, XLSX or PDF, speaks a transaction, enters a sale by hand, or sends a record through the Telegram channel. | No one has to rebuild their record-keeping before getting value. |
| **2. Extract** | Fields are pulled out of messy sources and structured into transactions. | Turns paper, speech and spreadsheets into data. |
| **3. Review** | The owner sees what was read, corrects uncertain fields and confirms. **Nothing is saved before this step.** | Keeps the human in charge and keeps errors out of the books. |
| **4. Reconcile** | Sales, expenses, purchases and stock movements are compared per product. Variances are flagged. | Shows what the evidence supports and what does not add up. |
| **5. Seal** | Each confirmed record is canonicalised, hashed, chained to the previous record and signed. | Any later change is detectable. |
| **6. Understand** | Revenue ranges, a Consistency Score, completeness tracking, deterministic recommendations and plain-language explanations from Themba. | Turns numbers into decisions. |
| **7. Grow** | Guided tasks, purchase orders, reinvestment scenarios and a funding directory. Exportable, verifiable statements for lenders. | Moves from "what happened" to "what next". |

```mermaid
journey
    title A trader's week with SCRIBE
    section Everyday records
      Photograph a supplier receipt: 4: Owner
      Say a purchase out loud: 5: Owner
      Upload last month's stock sheet: 3: Owner
      Record a sale at the till: 5: Owner
    section Trust the numbers
      Review and confirm extracted rows: 4: Owner
      See a stock variance flagged: 3: Owner, SCRIBE
      Ask Themba why it happened: 4: Owner, Themba
    section Plan the next move
      Approve a suggested restock task: 5: Owner, Themba
      Simulate reinvesting a share of profit: 4: Owner
      Export a verifiable statement: 5: Owner
```

---

## What makes SCRIBE different

SCRIBE is not an OCR demo and not a ledger demo. The differentiator is how the parts work together.

| Differentiator | What it means in practice | Status |
|---|---|---|
| **Reconciliation, not just extraction** | Per-product stock math flags variances instead of simply displaying what was read from a document. | ✅ Working |
| **Deterministic recommendations** | Themba's Recommendations are computed from records with evidence, impact, downside and confidence. Not LLM-generated. | ✅ Working |
| **Traceable, tamper-evident records** | SHA-256 hash chain with Ed25519 signatures, a public verification page and a live Judge Mode tamper demo. | ✅ Working |
| **Honest uncertainty** | Revenue is a range that reflects evidence quality. The tool says what it cannot confirm. | ✅ Working |
| **Explainable readiness insight** | A 5-component Consistency Score with transparent counterfactuals ("what would change this score"). | ✅ Working |
| **Review-first imports** | CSV, XLSX, PDF, photo and voice captures all stop for confirmation. | ✅ Working |
| **Voice capture** | Speak a transaction. A deterministic parser extracts it and refuses ambiguous input. | ✅ Working (browser-dependent) |
| **Themba, a grounded copilot** | Context-aware, refuses unsafe requests, proposes actions that need approval. | ✅ Working |
| **Planning and funding preparation** | Start, Expand and Find Funding modes, a reinvestment simulator, a South African funding directory. | ✅ Working |
| **Trust Centre** | A single place explaining integrity, privacy and what the seal does and does not prove. | ✅ Working |
| **Telegram capture channel** | Send records through a chat app people already use. | 🧪 Prototype |
| **Adaptive record structures** | Business-specific columns and vocabulary, learned per business. | 🧭 Planned (UI mockup built) |
| **WhatsApp Business integration** | The channel most traders actually live in. | 🧭 Planned |
| **Consented bank-feed verification tier** | Corroborate records against bank data with the owner's consent. | 🧭 Planned |

✅ working today · 🧪 prototype or limited · 🧭 planned

---

## What works today

<details open>
<summary><b>🔐 Cryptographic ledger</b></summary>

- Every record is canonicalised, SHA-256 hashed, chained to the previous record and Ed25519-signed.
- Any modification breaks the chain and is detectable on verification.
- A public page at `/verify/[business-id]` lets a lender or auditor confirm integrity without logging in.
- **Judge Mode** lets a reviewer deliberately tamper with a record, watch the chain break, and restore it.
- Append-only by design. Corrections are new records, not silent overwrites.

</details>

<details>
<summary><b>🧠 Themba, the AI business assistant</b></summary>

- Multi-provider gateway: Google Gemini first, Groq Llama 3.3 as fallback, then a deterministic fallback if every provider is down.
- Context-aware: tone and content adapt to the tab you are on (Stock, Growth, Settings).
- Grounded: figures come from the deterministic engine, never from the model's imagination.
- Agentic with consent: proposes `create_task` and `draft_message` as cards that need explicit approval.
- Safe: pre-flight refusals for credit decisions, theft accusations and regulated financial advice.

</details>

<details>
<summary><b>🎯 Recommendation engine</b></summary>

- Computed deterministically from real records.
- Each card carries a severity badge (Action, Monitor, Variance), an evidence panel, impact, downside and a confidence label.
- **Investigate** turns a recommendation into a Growth Studio task.
- Shows a quiet "nothing flagged" state rather than inventing issues.

</details>

<details>
<summary><b>📊 Deterministic financial engine</b></summary>

- Per-product stock reconciliation rather than aggregate math.
- Revenue **ranges** that reflect evidence quality.
- 5-component Consistency Score with counterfactuals.
- Data-completeness tracking: how much activity is backed by evidence.
- Pure SVG charts with no third-party chart library. Charts anchor to the latest transaction date in the dataset.

</details>

<details>
<summary><b>📥 Document intelligence and 🎤 voice</b></summary>

- CSV import with column mapping (PapaParse).
- XLSX and XLS import (SheetJS).
- PDF extraction through Gemini's native PDF reading.
- Photo scanning with an animated scan beam, corner brackets and a consent gate.
- Voice capture with a live transcript, a real waveform and a deterministic parser.
- Review-first workflow on every import, with a stock-impact preview.

</details>

<details>
<summary><b>🏢 Business Launch Studio and 📈 Growth Studio</b></summary>

- Three modes: **Start a Business**, **Expand My Business**, **Find Funding**.
- Reinvestment Simulator with live math across income, expenses, allocation and period.
- Real South African funding directory (NYDA, SEDFA, Department of Small Business Development).
- Goals, tasks and milestones, with tasks Themba proposes and the owner approves.

</details>

<details>
<summary><b>📦 Inventory, suppliers, sales and expenses</b></summary>

- Product catalogue with SKU, unit, cost and selling price, and reorder thresholds.
- Movement-based stock ledger. Balances are derived, never overwritten.
- Physical stock counts and a supplier directory.
- Low-stock alerts with a **Draft Purchase Order** workflow.
- Recording a sale deducts stock and updates cash flow. Recording an expense categorises it for the donut chart. The revenue range recalculates immediately.

</details>

<details>
<summary><b>📄 Reports and verification</b></summary>

- CSV transaction ledger export.
- Printable A4 financial statement with its cryptographic hash and a QR code.
- Evidence workspace: a split view of the original receipt next to the extracted data.
- Trust Centre explaining what the seal proves and does not prove.

</details>

<details>
<summary><b>🎨 Experience</b></summary>

- Three themes: Daylight, Night and Sunlight (high contrast).
- Installable PWA with an install prompt, offline banner and auto-recovery detection.
- Spring-physics animation, skeleton loaders, cursor-tracking spotlight cards.
- Glassmorphic mobile bottom navigation.

</details>

```mermaid
mindmap
  root((SCRIBE))
    Capture
      Photo OCR
      CSV and XLSX
      PDF
      Voice
      Manual entry
      Telegram prototype
    Trust
      SHA-256 hash chain
      Ed25519 signatures
      Public verification
      Judge Mode
      Review first
    Understand
      Per-product reconciliation
      Revenue ranges
      Consistency Score
      Recommendations
      Completeness
    Act
      Themba copilot
      Tasks and purchase orders
      Reinvestment simulator
      Funding directory
    Prove
      Printable statement
      QR and hash
      Evidence workspace
      Trust Centre
```

---

## Data integrity: the tamper-evident ledger

<div align="center">
<img src="docs/assets/ledger-chain.svg" alt="Animated hash chain: a record is altered, its hash mismatches and later records are flagged" width="100%"/>
</div>

<br/>

Each record is sealed in five moves:

1. **Canonicalise.** Keys are sorted and JSON is made deterministic, so the same record always produces the same bytes.
2. **Hash.** SHA-256 of the canonical form.
3. **Chain.** The hash of the previous record (`prev_hash`) is part of what gets hashed.
4. **Sign.** The hash is signed with an Ed25519 private key that lives only on the server.
5. **Verify.** Anyone can recompute the hashes, check the signatures and walk the chain.

```mermaid
sequenceDiagram
    autonumber
    actor Owner
    participant UI as Web app
    participant API as API route
    participant Guard as authorizeBusiness
    participant Engine as Deterministic engine
    participant Ledger as Ledger service
    participant DB as Turso (libSQL)

    Owner->>UI: Record a sale
    UI->>API: POST /api/sales
    API->>Guard: authorizeBusiness(business_id)
    Guard-->>API: allowed (or 404)
    API->>Engine: validate and compute stock effect
    Engine->>Ledger: canonicalise, hash, chain, sign
    Ledger->>DB: append record + stock movement
    DB-->>UI: updated dashboard state
```

An illustrative, simplified record shape (not the exact production schema):

```json
{
  "id": "rec_000123",
  "business_id": "biz_...",
  "type": "sale",
  "payload": { "product": "Albany Bread", "qty": 2, "amount": 38.0 },
  "prev_hash": "3be7...70a2",
  "hash": "c8d1...5e09",
  "signature": "ed25519:..."
}
```

### What the ledger proves, and what it does not

| It proves | It does **not** prove |
|---|---|
| A record has not been altered since it was sealed. | That the underlying sale actually happened. |
| The order of records has not been rearranged. | That the amounts were entered honestly. |
| The server signed the record. | That a supplier or customer agrees with it. |

That second column is why SCRIBE has **evidence tiers** (reported, document-supported, counter-signed) and a data-completeness measure, and why counter-signing and a consented bank-feed tier are on the roadmap. A tamper-evident record is not automatically a genuine transaction, and SCRIBE says so on its own verification page and statements.

---

## Reconciliation and the financial engine

Stock is reconciled **per product**, because aggregate math hides exactly the discrepancies a shop owner cares about.

```mermaid
flowchart TD
    O["Opening stock"] --> E
    P["+ Purchases and deliveries"] --> E
    S["- Sales"] --> E
    A["± Recorded adjustments"] --> E
    E["Expected stock"] --> V{"Compare with<br/>physical count"}
    C["Physical stock count"] --> V
    V -- "difference = 0" --> OK["Reconciled"]
    V -- "difference ≠ 0" --> F["Variance flagged<br/>with product, quantity and period"]
    F --> T["Themba explains and proposes<br/>a recount or follow-up task"]
    style OK fill:#d1fae5,stroke:#10b981,color:#064e3b
    style F fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
```

**Worked example from the demo workspace.** One variance was seeded on purpose to demonstrate the flow: *Albany Bread, −8 units.* The reconciliation view shows the expected quantity, the counted quantity and the gap, and Themba can explain it in plain language without accusing anyone of anything.

**Revenue as a range.** When some sales are backed by evidence and some are only claimed, a single revenue number would overstate certainty. SCRIBE shows a range whose width reflects how much of the activity is evidence-backed.

**Consistency Score.** A 5-component score, with transparent counterfactuals that show what would raise or lower it. It is an explainable indicator of how consistent the records are. It is **not** a credit score and has not been validated against lender decisions (see [Testing and validation](#testing-and-validation)).

---

## Themba's recommendation engine

The recommendation engine is the signature feature of the Intelligence view. It is separate from the chat copilot and does not use a language model to decide what to flag.

| Property | How it works |
|---|---|
| **Source** | Computed from sealed records, stock movements and reconciliation results. |
| **Severity** | 🔴 Action, 🔵 Monitor, 🟡 Variance. |
| **Explainability** | Every card has **Show evidence** with the exact numbers, plus impact, downside and a confidence label. |
| **Follow-through** | **Investigate** saves the item as a Growth Studio task. |
| **Honest quiet** | When nothing is flagged, the view shows a calm green state instead of manufacturing advice. |

---

## Themba, the business copilot

Themba helps owners ask better questions about their own business. It is deliberately constrained: **AI reads, code decides, the trader confirms.**

```mermaid
flowchart TD
    U["Owner asks a question"] --> PF{"Pre-flight safety check"}
    PF -- "credit decision, theft accusation,<br/>regulated advice" --> RF["Polite refusal with a safe alternative"]
    PF -- "allowed" --> CTX["Build context from the deterministic engine<br/>(current tab, real figures)"]
    CTX --> G["Gemini"]
    G -- "rate limit or error" --> Q["Groq Llama 3.3"]
    Q -- "rate limit or error" --> DF["Deterministic fallback answer"]
    G --> OUT
    Q --> OUT
    DF --> OUT["Plain-language answer<br/>with figures from the engine"]
    OUT --> ACT{"Proposes an action?"}
    ACT -- "yes" --> CARD["Approval card<br/>(create_task, draft_message)"]
    CARD -- "owner approves" --> WRITE["Saved to Growth Studio or drafted"]
    CARD -- "owner declines" --> NOOP["Nothing happens"]
    style RF fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style DF fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style WRITE fill:#d1fae5,stroke:#10b981,color:#064e3b
```

| Principle | How it is enforced |
|---|---|
| **Grounded** | Numbers are injected from the engine. The model explains them, it does not produce them. |
| **Consent before action** | Actions are structured cards. Nothing is written until the owner approves. |
| **Refuses what it should** | Pre-flight checks block credit decisions, theft accusations and regulated financial advice. |
| **Resilient** | If every AI provider fails, a deterministic fallback still answers from the engine. |
| **Context-aware** | Tone and content change with the tab, for example Stock versus Growth. |

---

## Document intelligence and voice capture

```mermaid
stateDiagram-v2
    [*] --> Uploaded: photo, CSV, XLSX, PDF or voice
    Uploaded --> Extracting: consent gate for photos
    Extracting --> InReview: fields extracted
    Extracting --> Failed: unreadable or unsupported
    InReview --> Corrected: owner edits uncertain fields
    Corrected --> InReview
    InReview --> Confirmed: owner confirms
    InReview --> Discarded: owner rejects
    Confirmed --> Sealed: appended to the ledger
    Failed --> [*]
    Discarded --> [*]
    Sealed --> [*]
```

| Source | How it is read | Notes |
|---|---|---|
| CSV | PapaParse with a column-mapping step | Works with the columns a business already has. |
| XLSX / XLS | SheetJS | Sheet and column mapping before import. |
| PDF | Gemini native PDF reading | Output is a draft until confirmed. |
| Photo | Gemini vision with a consent gate | Scan animation, corner brackets, review screen. |
| Voice | Browser Web Speech API plus a deterministic parser | Live transcript and waveform. Refuses ambiguous statements. Chrome, Edge and Safari only. |
| Manual | Sale and expense forms | Auto-deducts stock and updates cash flow. |

The original document stays linked to what was extracted from it. The evidence workspace shows them side by side so a reviewer, or a lender, can see where a number came from.

---

## Business Launch Studio and Growth Studio

```mermaid
flowchart LR
    subgraph Launch["Business Launch Studio"]
        S1["Start a Business"]
        S2["Expand My Business"]
        S3["Find Funding"]
    end
    S2 --> SIM["Reinvestment Simulator<br/>income · expenses · allocation · period"]
    S3 --> DIR["South African funding directory<br/>NYDA · SEDFA · DSBD"]
    S1 --> PLAN["Business plan workspace"]
    SIM --> TASKS
    DIR --> TASKS
    PLAN --> TASKS
    subgraph Growth["Growth Studio"]
        TASKS["Goals, tasks, milestones"]
    end
    TH["Themba proposes tasks"] -. "owner approves" .-> TASKS
    REC["Recommendations: Investigate"] -.-> TASKS
```

Projections rest on **explicit assumptions and the records the business actually has**. They are scenarios to think with, not guaranteed outcomes, and SCRIBE does not promise that funding will be granted.

---

## Architecture

```mermaid
flowchart TB
    subgraph Clients["User interfaces"]
        WEB["Web app (installable PWA)"]
        TG["Telegram bot (prototype)"]
        WA["WhatsApp (planned)"]
    end
    Clients -->|"HTTPS + httpOnly session cookie"| API
    subgraph API["Next.js API layer"]
        AUTH["Auth and session"]
        GUARD["Tenant guard: authorizeBusiness(business_id)"]
        VAL["Validation and rate limiting"]
    end
    API --> ENG
    API --> LED
    API --> AI
    subgraph ENG["Deterministic engine"]
        E1["Reconciliation"]
        E2["Consistency Score"]
        E3["Revenue ranges"]
        E4["Completeness"]
        E5["Recommendations"]
    end
    subgraph LED["Cryptographic ledger"]
        L1["Canonicalise"]
        L2["SHA-256 chain"]
        L3["Ed25519 sign"]
        L4["Verify"]
    end
    subgraph AI["Themba AI gateway"]
        A1["Pre-flight checks"]
        A2["Gemini then Groq"]
        A3["Deterministic fallback"]
    end
    ENG --> DB[("Turso (libSQL)")]
    LED --> DB
    AI --> DB
    AI -. "figures requested from" .-> ENG
```

**Principle:** *AI reads, code decides, the trader confirms, the ledger remembers.*

### Request lifecycle

Every request passes the same gates, in the same order:

1. Session cookie checked and the JWT validated.
2. `authorizeBusiness(business_id)` confirms the user belongs to that business. Unauthorised access returns **404**, not 403, so business IDs cannot be enumerated.
3. Input validation and rate limiting.
4. Deterministic engine and ledger logic do the work.
5. Only then does the database change.

### Technology choices

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | One codebase for UI and API, fast iteration, easy Vercel deploys. |
| Language | TypeScript (strict) | Money, hashes and stock math deserve types. |
| Styling | Tailwind CSS v4 with design tokens | Consistent themes (Daylight, Night, Sunlight) without heavy CSS. |
| Database | Turso (libSQL, serverless SQLite) | Cheap, fast, simple to back up and reason about. |
| Auth | Custom JWT with `jose`, scrypt hashing, httpOnly cookies | Small attack surface, no third-party session store. |
| Cryptography | Node `crypto` (SHA-256, Ed25519) | Standard, audited primitives instead of anything custom. |
| AI | Gemini (primary), Groq Llama 3.3 (fallback) | Resilience and cost control across providers, swappable without product changes. |
| Parsing | PapaParse, SheetJS, Gemini vision, Web Speech API | Cover the formats traders really have. |
| Charts | Pure SVG | No external chart libraries to load or audit. |
| Hosting | Vercel | Automatic deployments from `main`. |

---

## Data model

```mermaid
erDiagram
    USERS ||--o{ BUSINESS_MEMBERS : "belongs to"
    BUSINESSES ||--o{ BUSINESS_MEMBERS : "has"
    BUSINESSES ||--o{ RECORDS : "owns"
    BUSINESSES ||--o{ PRODUCTS : "stocks"
    BUSINESSES ||--o{ SUPPLIERS : "buys from"
    BUSINESSES ||--o{ GOALS : "plans"
    BUSINESSES ||--o| BUSINESS_PLANS : "drafts"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "changes by"
    GOALS ||--o{ TASKS : "broken into"

    RECORDS {
        string id PK
        string business_id FK
        string prev_hash
        string hash
        string signature
    }
    PRODUCTS {
        string id PK
        string sku
        string unit
        number cost_price
        number selling_price
        number reorder_threshold
    }
    STOCK_MOVEMENTS {
        string id PK
        string product_id FK
        number quantity_delta
        string reason
    }
```

| Table | Purpose |
|---|---|
| `users` | Account identity and hashed passwords |
| `businesses` | Business profile, currency, onboarding status |
| `business_members` | Role-based access (owner, admin, member) |
| `records` | The append-only cryptographic ledger |
| `products` | Catalogue with cost and selling prices |
| `stock_movements` | Append-only inventory ledger. Balances are derived. |
| `suppliers` | Supplier directory |
| `goals`, `tasks` | Growth Studio state |
| `business_plans` | Launch Studio workspace |

The schema lives in `src/lib/schema.sql` and is applied idempotently by `scripts/push-schema.mjs`.

---

## Security and privacy

| Area | Approach |
|---|---|
| **Passwords** | scrypt with a per-user salt. |
| **Sessions** | httpOnly, Secure, SameSite=Lax cookies. JWT expires after 7 days. |
| **Tenant isolation** | Every API route calls `authorizeBusiness(business_id)` before any read or write. Unauthorised access returns 404. |
| **Account safety** | No user enumeration on register or password reset. Reset tokens are hashed at rest, single-use and expire in 30 minutes. |
| **Ledger keys** | The Ed25519 private key is server-side only and never exposed. |
| **Secrets** | Configuration through environment variables. `.env.local` is gitignored. |
| **AI processing** | External AI processing is disclosed to users. Photo scanning is behind a consent gate. |

> **MVP caveat:** in this MVP the password-reset token is returned in the API response instead of being emailed, so the flow can be tested without an email provider. This must be replaced with email delivery before any real-world use (see [Roadmap](#roadmap)).

### POPIA

- A Privacy Policy is published at `/privacy`.
- The demo dataset comes from a real shop whose owner **consented** to anonymised use. Customer names, personal identifiers and sensitive items were anonymised or removed.
- No customer personal information appears in the demo.
- Data deletion is available on request.

### Data retention and deletion

| Data type | Retention | Deletion trigger |
|---|---|---|
| **Account (name, email, hashed password)** | Until the user requests deletion | Hard delete on request |
| **Business profile** | Until the user requests deletion | Hard delete on request |
| **Business records (sealed)** | Until the user requests deletion | Deleted from the ledger. Statements already issued remain valid but are marked superseded. |
| **Uploaded documents** | Until the user requests deletion | Deleted from storage. Extraction results remain, with the evidence reference marked `[removed]`. |
| **Audit log** | 6 months | Automatic sweep |
| **Password reset tokens** | 30 minutes | Automatic expiry |

**How to request deletion:** email the team using the [contact details](#team-and-contact) below. Account deletion is a manual process in this MVP. Automated self-service deletion is on the roadmap.

**What is not deleted:** the last hash and signature for a business remain verifiable against its business ID after records are deleted. This is by design, because the chain proves what existed at a point in time. It contains hashes only, not record contents.

### What we track (and what we don't)

**We track product events, not business data:**

- `signup_completed`, `login_completed` (user ID only)
- `sale_recorded`, `expense_recorded` (business ID and user ID, no amounts)
- `csv_import_completed`, `csv_import_failed` (row count only, no content)
- `ledger_tampered`, `ledger_restored` (business ID, event only)
- `themba_message_sent`, `themba_action_approved` (provider name, no content)

**We do not track:**

- Transaction descriptions or amounts
- Receipt images or OCR text
- AI prompt contents or responses
- Email addresses in analytics events
- Any customer personal information

Analytics events are used only to improve the product. They are not shared with advertisers or unrelated third parties.

---

## Testing and validation

This section is deliberately plain. **If something has not been measured, it says so.**

### Automated checks in the repository

| Script | What it covers |
|---|---|
| `scripts/test-ledger.ts` | Hash chain and signature integrity |
| `scripts/test-reconcile.ts` | Stock reconciliation math |
| `scripts/test-score.ts` | Readiness and Consistency Score computation |

```bash
npx tsx --env-file=.env.local scripts/test-ledger.ts
npx tsx --env-file=.env.local scripts/test-reconcile.ts
npx tsx --env-file=.env.local scripts/test-score.ts
```

### Evidence table

| Measure | What we report | Result |
|---|---|---|
| **Demo dataset** | Real, anonymised spaza records loaded into the live workspace | 21,093 transactions (2021–2026), 44 products, 15,045 stock movements |
| **Reconciliation detection** | Whether a known, seeded discrepancy is surfaced | Seeded Albany Bread −8 variance is flagged. This is a demonstration test, **not** an accuracy benchmark. |
| **Ledger tamper detection** | Whether altering a sealed record is detected | Detected by chain verification (`test-ledger.ts`) and demonstrable live in Judge Mode. Published pass counts: *not yet compiled in this README.* |
| **Voice parser behaviour** | Whether ambiguous statements are refused and unit prices multiplied correctly | Verified on the example phrases in the demo script. **No systematic accuracy benchmark yet.** |
| **OCR accuracy** | Field-level accuracy on manually verified sample documents | **Not yet evaluated** |
| **Human correction rate** | How often extracted fields need correcting | **Not yet evaluated** |
| **Handwriting and format coverage** | Performance across handwriting styles and document layouts | **Not yet evaluated** |
| **Business-owner usefulness** | Structured feedback from owners, with permission | **Not yet evaluated.** Early conversations only (see below). |
| **Lender usefulness** | Whether external lenders find the statements and verification page useful | **Not yet evaluated** |
| **Consistency Score validity** | Whether the score tracks real business health | **Not yet validated.** Method is transparent, outcomes are unproven. |
| **Load performance** | Dashboard load time with 21,093 records | **Target: under 2 seconds on a mobile connection. Not yet formally benchmarked.** |

### What happens when things fail

| Failure | Behaviour | Recovery |
|---|---|---|
| **Gemini rate limit (429)** | Automatic fallback to Groq Llama 3.3 | None needed. The user sees a normal response. |
| **Groq rate limit** | Automatic fallback to the deterministic engine | Response is shorter but still grounded. |
| **Both AI providers down** | Deterministic fallback answers from engine data | Same as above. |
| **Turso database unreachable** | Error toast, form preserved, retry available | Retry re-sends the exact request. |
| **Voice recognition failure** | Transcript preserved, error shown, retry button | Edit the transcript or switch to manual entry. |
| **Browser doesn't support voice** | Clear message and manual entry fallback | **+ Record Sale** / **− Record Expense**. |
| **OCR extraction fails** | Original photo preserved, error shown | Retake or manual entry. |
| **Password reset token expired** | Clear error message | Request a new reset link. |
| **Session expired mid-action** | Redirected to login, work preserved in form | Log in and re-submit. |
| **Tamper detected** | Red forensic banner, chain-broken state, later records faded | Judge Mode **Restore** button. |
| **Deployment fails** | Vercel blocks the deploy and the previous version stays live | No action needed for the demo. |

### What we plan to measure next

1. Field-level OCR accuracy on a manually labelled sample of receipts, stock sheets and handwritten notes.
2. Correction rate during review, per field type.
3. Voice parser accuracy across accents and phrasings, including isiXhosa and isiZulu code-switching.
4. Time to first useful insight for a new owner.
5. Structured feedback sessions with consenting owners.
6. A short review of the printable statement and verification page with a lender or support-programme officer.

---

## Running cost

The demo runs on free tiers. The table below shows what a pilot would plausibly cost.

| Component | Free tier (what the demo uses) | At pilot scale (about 10 businesses, estimate) |
|---|---|---|
| **Vercel** | Hobby (free) | Pro: about $20/month |
| **Turso** | Free tier (generous storage and row-read allowance) | Developer plan: about $29/month |
| **Gemini API** | Free tier with rate limits | Pay-as-you-go, low at this volume |
| **Groq API** | Free tier | Minimal (fallback only) |
| **Total** | **$0 / month** | **about $50 / month** |

At roughly 100 businesses, the team estimates hosting plus AI at **about $200–300/month**. A planned pilot price of **R2,500/month per lender pilot** would cover this with margin; that pricing is an assumption that has not been tested with any lender.

> Provider pricing and free-tier limits change. Treat these figures as estimates and check each provider's current pricing page before relying on them.

AI providers sit behind one gateway, so if a free tier ends, the product switches to another provider or a paid tier without code changes to the features themselves.

---

## Development story and real-world engagement

SCRIBE began with one question:

> **What if the information a small business already records every day could become the foundation for its next stage of growth?**

An owner can spend a whole day serving customers, buying stock and recording sales, and still not be able to answer *"How well is my business actually doing, and what would it take to grow?"* We wanted to meet owners where they are, with the records they already keep, rather than ask them to change everything first.

### What has happened, and what has not

| Happened | Not yet happened |
|---|---|
| Discussions and early assessment with **Mr Lungiswa**, a spaza shop owner, about how business information can show performance, growth opportunity and expansion potential. | A completed pilot with measured outcomes. |
| Consent from the owner to use his **anonymised** records (five years of trading data) for the demo workspace. | Structured testing with several businesses. |
| A working application built and tested against that real dataset. | Verified results on OCR accuracy, owner usefulness or lender acceptance. |
| Design decisions shaped by what a real shop's data looks like: informal units, handwritten product names, uneven record-keeping. | Any claim that SCRIBE has improved profit, access to finance or funding approval. |

This engagement is **a starting point, not proof of broad adoption or financial impact.** It informs the product's philosophy: growth should rest on an understanding of current performance, resources, costs, risks and realistic opportunities, not on enthusiasm alone.

### Lessons that shaped the product

- **Real records are messy.** That is why imports are review-first and why revenue is a range.
- **A number without a source is a liability.** That is why every record is sealed and every extraction is linked to its evidence.
- **Owners need explanations, not dashboards.** That is why Themba exists, and why it is grounded in the engine.
- **Spoken is faster than typed.** That is why voice capture exists, and why its parser refuses to guess.
- **Trust comes from admitting limits.** That is why this README has a limitations section.

---

## Impact, limitations and responsible AI

### Intended impact

*These are intended outcomes that still require validation. SCRIBE does not guarantee access to finance, business success or funding approval.*

| For | Intended benefit |
|---|---|
| **Business owners** | Clearer visibility into sales, costs and stock. Faster spotting of missing or unexplained transactions. Less manual organising. Better decisions on purchasing, pricing and reinvestment. |
| **Aspiring entrepreneurs** | Structured planning, startup cost estimates, discovery of funding and mentorship, clearer budgets and supporting documents. |
| **The wider ecosystem** | Better record-keeping habits, more organised financial histories, and easier preparation of information for lenders and support organisations. |

### What SCRIBE does not do

- Verify that a sale was real. It shows only that a record has not been altered since sealing.
- Replace a credit score.
- Guarantee loan approval or repayment.
- Give regulated financial advice on loans, investments or tax.
- Guarantee higher profit.
- Independently authenticate every transaction.
- Integrate directly with point-of-sale systems (roadmap).

### Known limitations

- AI providers sometimes hit rate limits. The fallback chain engages automatically, but answers may be simpler.
- The import wizard does not yet detect duplicates through idempotency keys.
- Forecasts beyond 14 days use simplified assumptions.
- OCR quality across handwriting styles and layouts has not been measured.
- Voice capture depends on the browser's speech recognition and is unavailable on Firefox.
- The Consistency Score is explainable but unvalidated against outcomes.
- Password-reset emails are not yet sent (see the MVP caveat above).
- Account deletion is manual.
- Multi-language support (isiXhosa, isiZulu, Afrikaans) has infrastructure in place, but translations are awaiting native-speaker review.

### Responsible AI principles

1. **Make assumptions visible.** Ranges, counterfactuals and completeness measures exist so uncertainty is shown, not hidden.
2. **Keep humans in control.** Review-first imports and approval cards mean nothing important happens silently.
3. **Ground every figure.** The model explains numbers computed by code, and recommendations are deterministic.
4. **Refuse what it should refuse.** No credit decisions, no accusations, no regulated advice.
5. **Fail safely.** If AI is unavailable, deterministic answers still work.
6. **Respect people's data.** Consent, anonymisation, disclosure of external processing, minimal telemetry, deletion on request.

---

## Roadmap

```mermaid
flowchart LR
    subgraph NOW["Now: working MVP"]
        N1["Hash-chained, signed ledger"]
        N2["Per-product reconciliation"]
        N3["Themba copilot and recommendations"]
        N4["Review-first imports and voice"]
        N5["Launch and Growth Studios"]
    end
    subgraph NEXT["Next: validate and harden"]
        X1["OCR and voice accuracy study"]
        X2["Duplicate detection on import"]
        X3["Owner feedback sessions"]
        X4["Native-reviewed isiXhosa, isiZulu, Afrikaans"]
        X5["Email delivery for password reset"]
        X6["Self-service account deletion"]
        X7["Full PDF invoice export"]
    end
    subgraph LATER["Later: reach and trust"]
        L1["WhatsApp Business integration"]
        L2["Consented bank-feed verification tier"]
        L3["Supplier and customer counter-signing"]
        L4["Adaptive OCR with per-business vocabulary"]
        L5["Custom ledger column builder"]
        L6["POS integrations"]
    end
    NOW --> NEXT --> LATER
```

---

## Setup and environment

### Prerequisites

- **Node.js 20+**
- **Git**
- A **Turso** account or the Turso CLI

### Install

```bash
git clone https://github.com/vna-07/scribe-app.git
cd scribe-app
npm install
cp .env.example .env.local
# fill in your secrets (see below)
```

### Database

```bash
# apply the schema to Turso (idempotent)
node --env-file=.env.local scripts/push-schema.mjs
```

To (re)create the demo business and its dataset, see `scripts/import-siyanda.ts`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` in the project root:

```bash
# ─── DATABASE ───
TURSO_URL=libsql://your-database.turso.io
TURSO_TOKEN=your-turso-token

# ─── AUTH ───
JWT_SECRET=<64-hex-chars>            # openssl rand -hex 32

# ─── CRYPTOGRAPHY ───
ED25519_PRIVATE_KEY_B64=<base64-pem>
ED25519_PUBLIC_KEY_B64=<base64-pem>
# generate a key pair: node scripts/gen-keys.mjs

# ─── AI PROVIDERS ───
GEMINI_API_KEY=<your-gemini-key>
GROQ_API_KEY=<your-groq-key>         # optional fallback

# ─── DEPLOYMENT ───
NEXT_PUBLIC_APP_URL=https://scribe-app-xi.vercel.app
```

> ⚠️ Never commit `.env.local`. It is gitignored. Treat the Ed25519 private key and `JWT_SECRET` like passwords.

### Scripts

| Script | Purpose |
|---|---|
| `scripts/push-schema.mjs` | Idempotently applies the schema to Turso |
| `scripts/gen-keys.mjs` | Generates an Ed25519 key pair |
| `scripts/import-siyanda.ts` | Recreates the demo business, dataset and demo account |
| `scripts/test-ledger.ts` | Tests hash chain and signature integrity |
| `scripts/test-reconcile.ts` | Tests stock reconciliation math |
| `scripts/test-score.ts` | Tests readiness scoring |

---

## Browser support

**Minimum requirements:** Node 20+ on the server and a modern browser (2023 or newer) on the client. No IE11 and no legacy Edge.

| Browser | Core app | Voice capture | PWA install | Notes |
|---|---|---|---|---|
| **Chrome (desktop)** | ✅ | ✅ | ✅ | Full support |
| **Chrome (Android)** | ✅ | ✅ | ✅ | Install prompt available |
| **Safari (desktop)** | ✅ | ✅ | ✅ | Full support |
| **Safari (iOS)** | ✅ | ✅ | ✅ | Voice may need a tap to enable. Install via Share → Add to Home Screen. |
| **Edge (desktop)** | ✅ | ✅ | ✅ | Full support |
| **Firefox** | ✅ | ❌ | ❌ | Voice capture unsupported. Manual entry fallback is shown. |

Charts are pure SVG, so no chart library is loaded. The dashboard load-time target is covered under [Testing and validation](#testing-and-validation).

---

## Deployment and rollback

Deployed on Vercel with automatic deployments from the `main` branch.

```bash
vercel --prod
```

Production checklist:

- ✅ All environment variables set in the Vercel dashboard
- ✅ Turso database configured with the schema
- ✅ Ed25519 keys generated and stored securely
- ✅ Domain: `scribe-app-xi.vercel.app`

### Rollback procedure

If a deployment breaks production:

1. Open **Vercel → Deployments**.
2. Find the last known-good deployment.
3. Open its three-dot menu and choose **Promote to Production**.
4. Vercel swaps the domain to the previous build, typically within seconds.
5. No database migration rollback is needed, because the schema is idempotent and additive.

The database is protected by Turso's backup and point-in-time recovery features. Confirm the retention window for your Turso plan in the Turso dashboard and test a restore before relying on it for production data.

---

## API reference

All routes require a valid session cookie except `/api/auth/*`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| POST | `/api/auth/password-reset/request` | Request a reset token |
| POST | `/api/auth/password-reset/confirm` | Confirm a reset |
| GET, POST | `/api/businesses` | List or create businesses |
| GET | `/api/demo/[id]` | Load full dashboard data |
| POST | `/api/records` | Seal a new ledger record |
| POST | `/api/sales` | Record a sale (deducts stock) |
| POST | `/api/expenses` | Record an expense |
| GET, POST | `/api/stock` | Products, movements, counts |
| GET, POST | `/api/suppliers` | Supplier directory |
| GET, POST | `/api/goals` | Goals, tasks, progress |
| POST | `/api/import` | CSV and XLSX import |
| POST | `/api/import/pdf` | PDF extraction |
| POST | `/api/ocr` | Image OCR for receipts |
| POST | `/api/themba` | AI assistant gateway |
| POST | `/api/scam-shield` | Rule-based scam detection |
| GET | `/api/ledger/verify` | Chain integrity check |
| GET | `/verify/[business-id]` | Public verification page (no login) |

---

## Version history

| Version | Date | Status | Highlights |
|---|---|---|---|
| **0.9.0** | 2026-10-26 | Current | Voice capture, recommendation engine, Trust Centre, PWA install prompt, Judge Mode, all P0 fixes from the security audit |
| **0.8.0** | 2026-10-25 | Superseded | Real Siyanda dataset integration, adaptive onboarding |
| **0.7.0** | 2026-10-25 | Superseded | Cryptographic ledger, deterministic reconciliation |
| **0.6.0** | 2026-10-24 | Superseded | Core dashboard, Themba AI gateway |
| **0.5.0** | 2026-10-24 | Superseded | Initial Next.js scaffold, auth, schema |

---

## Troubleshooting

<details>
<summary><b>Login says "Incorrect email or password"</b></summary>

<br/>

The demo credentials are `demo@scribe.co.za` / `DemoTrader2026!` and are case-sensitive. If the password was changed through the reset flow, the demo credentials no longer work. Run `scripts/import-siyanda.ts` to recreate the demo account.

</details>

<details>
<summary><b>Voice capture says "not supported"</b></summary>

<br/>

You are probably on Firefox. The Web Speech API works on Chrome, Edge and Safari. Use manual entry or switch browsers. On iOS Safari, you may need to tap to enable the microphone.

</details>

<details>
<summary><b>The chart shows no bars</b></summary>

<br/>

The chart anchors to the **latest transaction date in the dataset**, not today's date. A business with no recent records shows an empty chart by design. The demo business (Siyanda's Spaza) has records through October 2026.

</details>

<details>
<summary><b>Password reset token doesn't work</b></summary>

<br/>

The token expires after 30 minutes and works once. Request a new one via `/login` → "Forgot password". In this MVP the token is returned in the API response, not emailed, so the flow can be tested. Email delivery is on the roadmap.

</details>

<details>
<summary><b>The chain shows as broken and I didn't click "Try to Cheat"</b></summary>

<br/>

Open Judge Mode on the dashboard and click **Restore**. If the chain is still broken afterwards, run `scripts/test-ledger.ts` and contact the team.

</details>

---

## FAQ for reviewers

<details>
<summary><b>Is the data real?</b></summary>

<br/>

Yes. The demo workspace runs on real transaction records from a spaza shop, anonymised with the owner's consent. Customer names, personal identifiers and sensitive items were removed. One variance was seeded deliberately to demonstrate reconciliation.

</details>

<details>
<summary><b>Does the cryptography prove a sale really happened?</b></summary>

<br/>

No, and the product says so. It proves a record has not been altered since sealing. Proving that a sale was genuine needs corroboration, which is why evidence tiers exist and why counter-signing and bank-feed verification are on the roadmap.

</details>

<details>
<summary><b>Can Themba make things up?</b></summary>

<br/>

Figures come from the deterministic engine, not the model, and the recommendation engine does not use a language model at all. If every AI provider is down, a deterministic fallback still answers. Themba also refuses credit decisions, theft accusations and regulated financial advice, and any action it proposes needs the owner's approval.

</details>

<details>
<summary><b>Is this a credit score or a lending decision tool?</b></summary>

<br/>

No. The Consistency Score is an explainable indicator of how consistent the records are. It is not a credit score, it has not been validated against lender outcomes, and SCRIBE does not guarantee any funding result.

</details>

<details>
<summary><b>What is finished and what is not?</b></summary>

<br/>

See [What makes SCRIBE different](#what-makes-scribe-different) for status flags, [Testing and validation](#testing-and-validation) for what has and has not been measured, and [Roadmap](#roadmap) for what comes next.

</details>

<details>
<summary><b>How is one business's data kept from another's?</b></summary>

<br/>

Every API route calls `authorizeBusiness(business_id)` before reading or writing. Unauthorised requests get a 404 rather than a 403 so business IDs cannot be probed.

</details>

<details>
<summary><b>What does it cost to run?</b></summary>

<br/>

$0 per month for the demo on free tiers, and an estimated $50 per month for a 10-business pilot. See [Running cost](#running-cost) for the breakdown and caveats.

</details>

<details>
<summary><b>What happens to my data if I ask for deletion?</b></summary>

<br/>

Your account, business profile, records and uploaded documents are deleted. Previously issued statements are marked superseded, and only the final hash and signature remain verifiable. See [Data retention and deletion](#data-retention-and-deletion).

</details>

---

## Team and contact

**Code Blooded** · FNB App of the Year Hackathon 2026

| Person | Role |
|---|---|
| **Ayolela Vena** | Product and AI lead |
| **Lindokuhle Klaas** | Field research and impact |
| **Leopa** | Technical lead (security, cryptography, infrastructure) |

**Contact:** [avianrossi@gmail.com](mailto:avianrossi@gmail.com)
**Live app:** [scribe-app-xi.vercel.app](https://scribe-app-xi.vercel.app) · **Source:** [github.com/vna-07/scribe-app](https://github.com/vna-07/scribe-app)

Feedback from small-business owners, entrepreneurs, developers, lenders and potential partners is very welcome as we keep testing the product against real needs.

### Acknowledgements

With thanks to **Mr Lungiswa**, who trusted us with five years of real business records so SCRIBE could be built against the realities of a working spaza shop, and for the early conversations about performance and expansion that shaped this project.

### Glossary

| Term | Meaning |
|---|---|
| **Spaza shop** | A small informal convenience store, common in South African townships. |
| **Reconciliation** | Comparing expected stock and cash against what was actually counted or received. |
| **Hash chain** | Records linked so that each one contains the hash of the one before it. |
| **Ed25519** | A modern digital signature scheme. |
| **Tamper-evident** | Changes cannot be made without being detectable. Not the same as tamper-proof. |
| **Judge Mode** | A demo control that deliberately tampers with a record so reviewers can watch detection and recovery. |
| **POPIA** | South Africa's Protection of Personal Information Act. |
| **NYDA / SEDFA / DSBD** | National Youth Development Agency, Small Enterprise Development and Finance Agency, Department of Small Business Development. |

### License

Built for educational and demonstration purposes as part of the FNB App of the Year Hackathon 2026. Not for commercial use without permission.

<div align="center">

<br/>

**SCRIBE Intelligence**
*Real Records. Greater Opportunities.*

**Better records. Clearer decisions. More informed growth.**

</div>
