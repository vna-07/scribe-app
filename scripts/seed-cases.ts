/// <reference types="node" />
import dotenv from "dotenv";
import { db, nowMs, uuid } from "../src/lib/db";

// Load .env.local first (Next.js convention), then .env as a fallback.
dotenv.config({ path: ".env.local" });
dotenv.config();

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scribe.co.za";

async function main() {
  // 1. Get the demo business
  const userRes = await db().execute({ sql: "SELECT id FROM users WHERE email = ?", args: [DEMO_EMAIL] });
  if (userRes.rows.length === 0) throw new Error("Demo user not found. Run seed-demo.ts first.");

  const bizRes = await db().execute({ sql: "SELECT business_id FROM business_members WHERE user_id = ?", args: [userRes.rows[0].id] });
  if (bizRes.rows.length === 0) throw new Error("Demo business not found.");
  const bizId = String(bizRes.rows[0].business_id);

  console.log("Seeding 8 demo cases for business:", bizId);

  // Clear existing cases to make it idempotent
  await db().execute({ sql: "DELETE FROM cases WHERE business_id = ?", args: [bizId] });

  const cases = [
    { title: "1. Legitimate Payment", status: "resolved", findings: "Receipt matches bank statement. Supplier details verified. No action required." },
    { title: "2. Amount Mismatch", status: "investigating", findings: "Receipt shows R450.00 but bank SMS shows R540.00. Possible typo or overcharge. Flagged for trader review." },
    { title: "3. Pending Payment", status: "open", findings: "Invoice generated 14 days ago. No matching bank transaction found in the records provided." },
    { title: "4. Altered Document Indicators", status: "investigating", findings: "Metadata suggests the PDF was edited after generation. Font inconsistencies detected on the total amount line." },
    { title: "5. Supplier Bank-Detail Change", status: "investigating", findings: "Supplier requested a change of banking details via email. Email domain does not match supplier's official website. High risk of BEC fraud." },
    { title: "6. Duplicate Transaction", status: "open", findings: "Two identical card transactions (R890) recorded 3 minutes apart. Likely accidental double-swipe." },
    { title: "7. Stock Variance", status: "investigating", findings: "Albany Bread theoretical stock: 38. Physical count: 30. Variance: -8 units. Requires a recount and waste check." },
    { title: "8. Multi-Document Investigation", status: "open", findings: "3 receipts uploaded for a single supplier. Total amount does not match the delivery note. Missing 1 case of oil." },
  ];

  for (const c of cases) {
    await db().execute({
      sql: "INSERT INTO cases (id, business_id, title, status, findings, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [uuid(), bizId, c.title, c.status, c.findings, nowMs()],
    });
  }

  console.log("✓ Seeded 8 cases successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});