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
    { title: "1. Legitimate Payment", status: "resolved" },
    { title: "2. Amount Mismatch", status: "investigating" },
    { title: "3. Pending Payment", status: "open" },
    { title: "4. Altered Document Indicators", status: "investigating" },
    { title: "5. Supplier Bank-Detail Change", status: "requires_attention" },
    { title: "6. Duplicate Transaction", status: "open" },
    { title: "7. Stock Variance", status: "investigating" },
    { title: "8. Multi-Document Investigation", status: "open" },
  ];

  for (const c of cases) {
    await db().execute({
      sql: "INSERT INTO cases (id, business_id, title, status, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [uuid(), bizId, c.title, c.status, nowMs()],
    });
  }

  console.log("✓ Seeded 8 cases successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});