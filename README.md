# SCRIBE Intelligence

> **Real Records. Greater Opportunities.**
> *Turning everyday business records into opportunities for growth.*

**SCRIBE** stands for **S**mall-business **C**larity, **R**ecords, **I**ntelligence, and **B**usiness **E**nablement: better records, clearer financial understanding, actionable intelligence, and support for starting or expanding a business.

A financial intelligence and business operations platform for South African informal traders, spaza shops, and micro-enterprises. SCRIBE turns fragmented business records into structured, cryptographically sealed financial information, and helps owners understand what the evidence supports, what doesn't reconcile, and what still needs to be verified.

Built for the **FNB App of the Year Hackathon 2026**, Youth Entrepreneurship & Small-Business Growth track.

🌐 **Live application:** [https://scribe-app-xi.vercel.app](https://scribe-app-xi.vercel.app)
💻 **Source code:** [https://github.com/vna-07/scribe-app](https://github.com/vna-07/scribe-app)

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Why This Track](#why-this-track)
4. [Live Demo](#live-demo)
5. [The Real Data Story](#the-real-data-story)
6. [Key Features](#key-features)
7. [Tech Stack](#tech-stack)
8. [Architecture](#architecture)
9. [Security & Cryptography](#security--cryptography)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Database Schema](#database-schema)
13. [Scripts Reference](#scripts-reference)
14. [API Reference](#api-reference)
15. [Deployment](#deployment)
16. [Potential Impact](#potential-impact)
17. [Philosophy](#philosophy)
18. [Honest Limits](#honest-limits)
19. [Team](#team)

---

## The Problem

A small business can trade every day and still struggle to explain how well it is performing. Sales sit in handwritten notebooks, supplier purchases exist only as receipts, stock is tracked informally, and cash transactions are scattered across different records.

- **33.6%** official unemployment (Q2 2026)
- **47.4%** youth unemployment
- **1.9M** non-VAT-registered business owners
- Roughly **19.5%** of employment is in the informal sector

A spaza shop owner knows how much is in the till but cannot reliably explain the gap between expected and actual stock. They have receipts but no consolidated view of profitability, and no structured record to show a lender.

The problem isn't that these businesses are unprofitable. **It's that their financial activity is difficult to reconstruct, reconcile, explain, and substantiate.** The gap SCRIBE addresses is the distance between running a business and being able to understand, demonstrate, and finance its growth.

---

## The Solution

SCRIBE is not just a bookkeeping app. It is a **financial intelligence layer** that:

1. **Captures** fragmented records (photo, CSV, XLSX, PDF, manual entry, Telegram)
2. **Seals** them into a cryptographic ledger (SHA-256 + Ed25519)
3. **Reconciles** stock movements per product and flags discrepancies
4. **Explains** them in plain language through Themba, the AI assistant
5. **Acts** on insights with guided workflows (tasks, purchase orders, growth plans)
6. **Proves** them via exportable, verifiable financial statements

> *Most tools record what a business says happened. SCRIBE shows what the evidence supports, what doesn't reconcile, and what still needs to be verified.*

**Core principle:** *A business should not need perfect records before it can begin improving them.*

---

## Why This Track

We chose **Youth Entrepreneurship and Small-Business Growth** because technology should help existing businesses become more capable of growing, not only help people discover new ideas. Rather than assuming every business can adopt expensive accounting software, SCRIBE starts with the information a business already has and helps turn it into something useful.

---

## Live Demo

🔗 **URL:** [https://scribe-app-xi.vercel.app](https://scribe-app-xi.vercel.app)

📄 **Pre-seeded demo business:** "Siyanda's Spaza", Gugulethu & Khayelitsha, Western Cape

Open the live link to explore the pre-seeded demo workspace.

---

## The Real Data Story

The demo workspace is not a mockup. It runs on **real transaction data** from **Siyanda Lungiswa**, a 20-year-old spaza shop owner in Gugulethu/Khayelitsha.

- **21,093 transactions** from 2021 to 2026
- **44 products** tracked with cost and selling prices
- **15,045 stock movements**
- **One intentional variance** seeded for demonstration (Albany Bread −8 units)

Customer names, personal identifiers, and sensitive items have been anonymised or removed to comply with POPIA. The owner consented to the use of his anonymised data for this demonstration.

---

## Key Features

### 🔐 Cryptographic Ledger
- Every record is canonicalized, SHA-256 hashed, chained to the previous record, and Ed25519-signed
- Any modification breaks the hash chain and is instantly detectable
- Public verification page at `/verify/[business-id]` lets a lender or auditor independently confirm integrity
- Append-only design, with no silent overwrites

### 🧠 Themba, the AI Business Assistant
- Multi-provider AI gateway (Google Gemini primary, Groq Llama fallback)
- **Context-aware:** adapts tone to the tab being viewed (Stock, Growth, Settings)
- **Grounded:** every figure comes from the deterministic engine, never invented
- **Agentic:** proposes structured actions (`create_task`, `draft_message`) as UI cards that require explicit user approval
- **Safe:** pre-flight refusals for credit decisions, theft accusations, and regulated financial advice
- **Resilient:** a deterministic fallback works even if all AI providers are down

### 📊 Deterministic Financial Engine
- Per-product stock reconciliation (not aggregate math)
- Revenue ranges that reflect evidence quality instead of fake single numbers
- 5-component Consistency Score with transparent counterfactuals
- Data completeness tracking (how much activity is evidence-backed)
- Pure SVG charts, with no external chart libraries

### 📥 Document Intelligence
- **CSV import** with column mapping
- **XLSX/XLS import** via SheetJS
- **PDF extraction** via Gemini's native PDF reading
- **Photo scanning** with animated scan beam, corner brackets, and a consent gate
- Every import follows a **review-first workflow**: nothing is saved without confirmation

### 🏢 Business Launch Studio
- Three modes: **Start a Business**, **Expand My Business**, **Find Funding**
- Interactive **Reinvestment Simulator** (income, expenses, allocation, period)
- Real South African funding directory (NYDA, SEDFA, Department of Small Business Development)
- Projections rest on explicit assumptions and available records, never guaranteed outcomes

### 📈 Growth Studio
- Goals, tasks, and milestones
- Themba proposes tasks, and the user approves them into the workspace
- Progress tracking with checkboxes and inline deletion

### 📦 Inventory & Suppliers
- Product catalogue with SKU, unit, cost/selling price, and reorder thresholds
- Movement-based stock ledger (not overwritable balances)
- Physical stock counts and a supplier directory
- **Low-stock alerts** with a "Draft Purchase Order" workflow

### 💰 Sales & Expenses
- Record a sale: inventory is deducted and cash flow updated
- Record an expense: auto-categorized for the donut chart
- Revenue range recalculates in real time

### 📄 Reports & Verification
- CSV transaction ledger export
- **A4 printable Financial Statement** with cryptographic hash and QR code
- Public verification page (no login required for lender inspection)
- Evidence workspace with split view of receipt and extracted data

### 🎨 UI/UX
- Three themes: **Daylight**, **Night**, **Sunlight** (high contrast)
- Spring-physics animations, staggered entrances, skeleton loaders
- PWA install prompt for Android/iOS
- Offline banner with auto-recovery detection
- Cursor-tracking spotlight cards and tactile buttons
- Glassmorphic mobile bottom navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 with custom design tokens |
| **Database** | Turso (libSQL, serverless SQLite) |
| **Auth** | Custom JWT via `jose`, scrypt hashing, httpOnly cookies |
| **Cryptography** | Node `crypto` (SHA-256 hash chain + Ed25519 signatures) |
| **AI Providers** | Google Gemini (primary) + Groq Llama 3.3 (fallback) |
| **Document Parsing** | PapaParse (CSV), SheetJS (XLSX), Gemini Vision (PDF/images) |
| **Charts** | Pure SVG |
| **Deployment** | Vercel |
| **Version Control** | Git + GitHub |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACES                        │
│        Web App (PWA) · Telegram Bot · WhatsApp (planned)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                 HTTPS + Session Cookies
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    NEXT.JS API LAYER                        │
│   Auth · Tenant Guard · Validation · Rate Limiting          │
│   Every request → authorizeBusiness(business_id)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌──────▼──────────┐
│ Deterministic │  │ Cryptographic │  │   Themba AI     │
│    Engine     │  │    Ledger     │  │    Gateway      │
│               │  │               │  │                 │
│ • Reconcile   │  │ • SHA-256     │  │ • Pre-flight    │
│ • Score       │  │ • Ed25519     │  │ • Gemini/Groq   │
│ • Ranges      │  │ • Chain       │  │ • Fallback      │
│ • Completeness│  │ • Verify      │  │ • JSON parsing  │
└───────┬───────┘  └───────┬───────┘  └──────┬──────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  Turso Database  │
                  │     (libSQL)     │
                  └──────────────────┘
```

**Principle:** *AI reads, code decides, the trader confirms, the ledger remembers.*

---

## Security & Cryptography

### Ledger Integrity
- Records are canonicalized (sorted keys, deterministic JSON)
- **SHA-256** hash of the canonical form, chained to the previous record's hash (`prev_hash`)
- Signed with an **Ed25519** private key (server-side, never exposed)
- Verification recomputes the hash, checks the signature, and verifies the chain

**What a signature proves:** a record has not been altered since it was sealed.
**What it does NOT prove:** that the underlying sale actually happened. That is why evidence tiers exist.

### Tenant Isolation
- Every API route calls `authorizeBusiness(business_id)` before any read or write
- Returns **404** (not 403) for unauthorized access to prevent business ID enumeration

### Auth
- scrypt password hashing with per-user salt
- httpOnly, Secure, SameSite=Lax session cookies; 7-day JWT expiry
- No user enumeration on register or password reset
- Reset tokens hashed at rest, single-use, 30-minute expiry

### POPIA Compliance
- Privacy Policy published at `/privacy`
- Data owner consented to anonymised use; no customer PII in the demo
- Data deletion available on request
- External AI processing disclosed

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- **Git**
- **Turso CLI** or a [Turso account](https://turso.tech)

### Installation

```bash
git clone https://github.com/vna-07/scribe-app.git
cd scribe-app
npm install
cp .env.example .env.local
# Fill in your secrets (see Environment Variables)
```

### Database Setup

```bash
# Push the schema to Turso
node --env-file=.env.local scripts/push-schema.mjs
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

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
# Generate: node scripts/gen-keys.mjs

# ─── AI PROVIDERS ───
GEMINI_API_KEY=<your-gemini-key>
GROQ_API_KEY=<your-groq-key>         # Optional fallback

# ─── DEPLOYMENT ───
NEXT_PUBLIC_APP_URL=https://scribe-app-xi.vercel.app
```

> ⚠️ Never commit `.env.local`. It is already gitignored.

---

## Database Schema

Core tables (managed by `src/lib/schema.sql`):

| Table | Purpose |
|---|---|
| `users` | Account identity and hashed passwords |
| `businesses` | Business profile, currency, onboarding status |
| `business_members` | Role-based access (owner/admin/member) |
| `records` | The immutable cryptographic ledger |
| `products` | Product catalogue with cost/selling prices |
| `stock_movements` | Append-only inventory ledger |
| `suppliers` | Supplier directory |
| `goals` & `tasks` | Growth Studio state |
| `business_plans` | Launch Studio workspace |

---

## Scripts Reference

| Script | Purpose |
|---|---|
| `scripts/push-schema.mjs` | Idempotently applies schema to Turso |
| `scripts/gen-keys.mjs` | Generates an Ed25519 key pair |
| `scripts/test-ledger.ts` | Tests hash chain and signature integrity |
| `scripts/test-reconcile.ts` | Tests stock math |
| `scripts/test-score.ts` | Tests readiness scoring |

---

## API Reference

All routes require a valid session cookie (except `/api/auth/*`).

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/password-reset/request` | Request reset token |
| POST | `/api/auth/password-reset/confirm` | Confirm reset |
| GET/POST | `/api/businesses` | List / create businesses |
| GET | `/api/demo/[id]` | Load full dashboard data |
| POST | `/api/records` | Seal a new ledger record |
| POST | `/api/sales` | Record a sale (deducts stock) |
| POST | `/api/expenses` | Record an expense |
| GET/POST | `/api/stock` | Products, movements, counts |
| GET/POST | `/api/suppliers` | Supplier directory |
| GET/POST | `/api/goals` | Goals, tasks, progress |
| POST | `/api/import` | CSV/XLSX import |
| POST | `/api/import/pdf` | PDF extraction |
| POST | `/api/ocr` | Image OCR (receipts) |
| POST | `/api/themba` | AI assistant gateway |
| POST | `/api/scam-shield` | Rule-based scam detection |
| GET | `/api/ledger/verify` | Chain integrity check |

---

## Deployment

Deployed on Vercel with automatic deployments from the `main` branch.

```bash
vercel --prod
```

**Production checklist**
- ✅ All environment variables set in the Vercel dashboard
- ✅ Turso database configured with schema
- ✅ Ed25519 keys generated and secured
- ✅ Domain: `scribe-app-xi.vercel.app`

---

## Potential Impact

**For business owners:** clearer visibility into sales, costs, and stock; faster identification of missing or unexplained transactions; less manual organising of scattered records; better-informed decisions on purchasing, pricing, and reinvestment.

**For aspiring entrepreneurs:** structured planning, startup cost estimates, discovery of funding and mentorship, and clearer budgets and documentation.

**For the wider ecosystem:** better recordkeeping habits, more organised financial histories, and easier preparation of information for lenders and support organisations.

These are intended outcomes that still require validation. SCRIBE does not guarantee access to finance, business success, or funding approval.

---

## Philosophy

Financial visibility should not be reserved for businesses that can afford sophisticated systems. A handwritten notebook, a pile of receipts, or a simple spreadsheet may already hold valuable information. The challenge is making it understandable, traceable, and useful.

AI should support accountability rather than obscure it: it should make assumptions visible, acknowledge uncertainty, and let people review important decisions. The goal is not to replace the owner's judgement, but to give it better information.

**Better records. Clearer decisions. More informed growth.**

---

## Honest Limits

SCRIBE is a working MVP with real data. It does not claim to be perfect.

**What SCRIBE does NOT do**
- Verify that a sale was real (only that the record has not been altered since sealing)
- Replace a credit score
- Guarantee loan approval or repayment
- Give regulated financial advice (loans, investments, tax)
- Guarantee higher profit
- Independently authenticate every transaction
- Provide direct POS integrations (roadmap)

**Roadmap**
- WhatsApp Business API integration
- Bank verification tier (consented bank feeds)
- Counter-signing (supplier/customer confirmation)
- Multi-language support (isiXhosa, isiZulu, Afrikaans; translations pending native review)
- Full PDF export for invoices
- Custom ledger column builder (UI mockup built)
- Adaptive OCR with per-business vocabulary learning

**Known limitations**
- AI providers occasionally hit rate limits (fallback engages automatically)
- The import wizard doesn't yet detect duplicates via idempotency keys
- Forecasts beyond 14 days use simplified assumptions

Early engagement with real business owners is a starting point, not proof of broad adoption or financial impact. We state these limits openly because trust is the product.

---

## Team

**Code Blooded**, FNB App of the Year Hackathon 2026

- **Ayolela Vena**: Product & AI lead
- **Lindokuhle Klaas**: Field research & impact
- **Leopa**: Technical lead (security, cryptography, infrastructure)

Special thanks to **Siyanda Lungiswa**, who trusted us with five years of real business data to prove SCRIBE works on real South African spazas.

---

## License

Built for educational and demonstration purposes as part of the FNB App of the Year Hackathon 2026. Not for commercial use without permission.

<p align="center">
  <strong>SCRIBE Intelligence</strong><br>
  <em>Real Records. Greater Opportunities.</em>
</p>
