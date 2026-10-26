import "dotenv/config";
import { db, nowMs, uuid } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { sealRecord } from "../src/lib/ledger";
import { readFileSync } from "node:fs";
import Papa from "papaparse";

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scribe.co.za";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "DemoTrader2026!";

async function main() {
  console.log("Wiping old demo data...");
  const existing = await db().execute({ sql: "SELECT id FROM users WHERE email = ?", args: [DEMO_EMAIL] });
  
  if (existing.rows.length > 0) {
    const userId = String(existing.rows[0].id);
    const bizRes = await db().execute({ sql: "SELECT business_id FROM business_members WHERE user_id = ?", args: [userId] });
    if (bizRes.rows.length > 0) {
      const bizId = String(bizRes.rows[0].business_id);
      await db().execute({ sql: "DELETE FROM stock_movements WHERE business_id = ?", args: [bizId] });
      await db().execute({ sql: "DELETE FROM products WHERE business_id = ?", args: [bizId] });
      await db().execute({ sql: "DELETE FROM records WHERE business_id = ?", args: [bizId] });
      await db().execute({ sql: "DELETE FROM business_members WHERE business_id = ?", args: [bizId] });
      await db().execute({ sql: "DELETE FROM businesses WHERE id = ?", args: [bizId] });
    }
    await db().execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
  }

  const userId = uuid();
  const bizId = uuid();
  const now = nowMs();

  // 1. Create the User and Business
  await db().execute({
    sql: `INSERT INTO users (id, name, email, password_hash, email_verified_at, is_demo, is_admin, created_at) VALUES (?, ?, ?, ?, ?, 1, 1, ?)`,
    args: [userId, "Siyanda Lungiswa", DEMO_EMAIL, hashPassword(DEMO_PASSWORD), now, now],
  });

  await db().execute({
    sql: `INSERT INTO businesses (id, name, business_type, location, currency, trading_since, operating_notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      bizId, "Siyanda's Spaza", "Spaza shop", "Gugulethu & Khayelitsha, Western Cape", "ZAR", "2006-01",
      "Real 20-year-old trading history. Data from 2021-2026 provided by owner, anonymised for privacy.",
      now
    ],
  });
  await db().execute({ sql: `INSERT INTO business_members (business_id, user_id, role) VALUES (?, ?, 'owner')`, args: [bizId, userId] });

  // 2. Parse the Files
  console.log("Reading CSVs...");
  const salesCsv = readFileSync("./scripts/data/siyanda_sales.csv", "utf8");
  const expCsv = readFileSync("./scripts/data/siyanda_expenses.csv", "utf8");
  
  const salesData = Papa.parse(salesCsv, { header: true, skipEmptyLines: true }).data as any[];
  const expData = Papa.parse(expCsv, { header: true, skipEmptyLines: true }).data as any[];

  // 3. Setup Products
  console.log("Creating product catalogue...");
  const productMap = new Map<string, string>(); // SKU -> UUID
  
  for (const row of salesData) {
    const sku = row["Product_SKU"];
    if (sku && !productMap.has(sku)) {
      const pid = uuid();
      productMap.set(sku, pid);
      await db().execute({
        sql: `INSERT INTO products (id, business_id, name, sku, unit, cost_price_cents, selling_price_cents, created_at) VALUES (?, ?, ?, ?, 'unit', ?, ?, ?)`,
        args: [
          pid, bizId, sku, sku, 
          Math.round(parseFloat(row["Unit_Cost_Price_ZAR"] || "0") * 100),
          Math.round(parseFloat(row["Unit_Selling_Price_ZAR"] || "0") * 100),
          now
        ]
      });
    }
  }

  // Batch inserts for speed (declared here so opening stock can push into them)
  const recordBatches: any[] = [];
  const movementBatches: any[] = [];

  // Single chain head threaded through opening stock → sales → expenses
  let head: { seq: number; canonical_hash: string } | null = null;

  // 4. Seed Opening Stock
  // Without this, every product's expected quantity is negative on day one, and the
  // Dashboard's "Stock gaps" KPI lights up red for every product from the start.
  console.log("Seeding opening stock...");

  const totalSalesQty = new Map<string, number>();
  for (const row of salesData) {
    const sku = row["Product_SKU"];
    const qty = parseInt(row["Quantity"]) || 0;
    totalSalesQty.set(sku, (totalSalesQty.get(sku) || 0) + qty);
  }

  const earliestTimestamp = salesData.length > 0
    ? Math.min(...salesData.map((r) => new Date(r.Timestamp).getTime()))
    : Date.now();
  const openingDate = earliestTimestamp - 86_400_000; // One day before first sale

  for (const [sku, pid] of productMap.entries()) {
    const totalSold = totalSalesQty.get(sku) || 0;
    // Opening stock = 1.5x total sales (buffer so expected stays positive across all sales)
    const openingQty = Math.ceil(totalSold * 1.5);

    const recId = uuid();
    const sealed = sealRecord(head, {
      id: recId, business_id: bizId, kind: "stock_purchase",
      amount_cents: 0, quantity: openingQty,
      description: `Opening stock — ${sku} (${openingQty} units)`,
      occurred_at: openingDate,
      source_channel: "web", status: "saved", evidence_tier: "document_supported",
    });

    recordBatches.push({
      sql: `INSERT INTO records (id, business_id, seq, kind, amount_cents, quantity, description, occurred_at, source_channel, status, idempotency_key, evidence_tier, prev_hash, canonical_hash, signature, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [recId, bizId, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity, sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status, null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash, sealed.signature, userId, now]
    });

    movementBatches.push({
      sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity_delta, observed_quantity, reference_id, notes, created_at) VALUES (?, ?, ?, 'delivery', ?, null, ?, ?, ?)`,
      args: [uuid(), bizId, pid, openingQty, recId, `Opening stock for ${sku}`, openingDate]
    });

    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
  }

  // 5. Process Sales (Ledger + Stock Movements)
  console.log(`Processing ${salesData.length} sales...`);

  // Sort by timestamp
  salesData.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());

  for (const row of salesData) {
    const recId = uuid();
    const amountCents = Math.round(parseFloat(row["Gross_Sales_ZAR"]) * 100);
    const qty = parseInt(row["Quantity"]);
    const occurredAt = new Date(row["Timestamp"]).getTime();
    const sku = row["Product_SKU"];
    const pid = productMap.get(sku);

    const sealed = sealRecord(head, {
      id: recId, business_id: bizId, kind: "sale", amount_cents: amountCents, quantity: qty,
      description: `Sale: ${qty}x ${sku}`, occurred_at: occurredAt,
      source_channel: "web", status: "saved", evidence_tier: "document_supported",
    });

    recordBatches.push({
      sql: `INSERT INTO records (id, business_id, seq, kind, amount_cents, quantity, description, occurred_at, source_channel, status, idempotency_key, evidence_tier, prev_hash, canonical_hash, signature, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [recId, bizId, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity, sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status, null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash, sealed.signature, userId, now]
    });

    if (pid) {
      movementBatches.push({
        sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity_delta, observed_quantity, reference_id, notes, created_at) VALUES (?, ?, ?, 'sale', ?, null, ?, ?, ?)`,
        args: [uuid(), bizId, pid, -qty, recId, `Sold ${qty}`, occurredAt]
      });
    }
    
    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
  }

  // 6. Process Expenses
  console.log(`Processing ${expData.length} expenses...`);
  expData.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());

  for (const row of expData) {
    const recId = uuid();
    const amountCents = Math.round(parseFloat(row["Amount_ZAR"]) * 100);
    const occurredAt = new Date(row["Timestamp"]).getTime();
    const desc = row["Description"] || row["Expense_Subcategory"];

    const sealed = sealRecord(head, {
      id: recId, business_id: bizId, kind: "expense", amount_cents: amountCents, quantity: null,
      description: desc, occurred_at: occurredAt,
      source_channel: "web", status: "saved", evidence_tier: "document_supported",
    });

    recordBatches.push({
      sql: `INSERT INTO records (id, business_id, seq, kind, amount_cents, quantity, description, occurred_at, source_channel, status, idempotency_key, evidence_tier, prev_hash, canonical_hash, signature, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [recId, bizId, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity, sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status, null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash, sealed.signature, userId, now]
    });

    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
  }

  // 7. Execute Batches (Turso has a limit, so we chunk by 200)
  console.log("Sealing to Turso database...");
  for (let i = 0; i < recordBatches.length; i += 200) {
    const chunk = recordBatches.slice(i, i + 200);
    await db().batch(chunk, "write");
  }
  for (let i = 0; i < movementBatches.length; i += 200) {
    const chunk = movementBatches.slice(i, i + 200);
    await db().batch(chunk, "write");
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  SIYANDA'S SPAZA SEEDED SUCCESSFULLY");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Login:       ${DEMO_EMAIL}`);
  console.log(`  Password:    ${DEMO_PASSWORD}`);
  console.log(`  Business:    Siyanda's Spaza (Gugulethu/Khayelitsha)`);
  console.log(`  Products:    ${productMap.size}`);
  console.log(`  Records:     ${recordBatches.length}`);
  console.log(`  Movements:   ${movementBatches.length}`);
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch(console.error);