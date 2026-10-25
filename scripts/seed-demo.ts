import "dotenv/config";
import { db, nowMs, uuid } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { sealRecord } from "../src/lib/ledger";

const DAY = 86_400_000;
const REFERENCE = new Date("2026-10-24T12:00:00Z").getTime();
const START = new Date("2026-05-01T00:00:00Z").getTime();
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scribe.co.za";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "DemoTrader2026!";

interface SupplierSpec {
  key: string;
  name: string;
  contact: string;
  phone: string;
  email: string | null;
}

const SUPPLIERS: SupplierSpec[] = [
  { key: "albany", name: "Albany Bakery", contact: "Sipho Ndlovu", phone: "046 622 1234", email: "orders@albanybakery.co.za" },
  { key: "coca", name: "Coca-Cola Beverages SA", contact: "Thabo Mkhize", phone: "086 011 2222", email: "orders@ccbsa.co.za" },
  { key: "makro", name: "Makro Port Elizabeth", contact: "Accounts Dept", phone: "041 404 0000", email: "orders@makro.co.za" },
  { key: "cashcarry", name: "Grahamstown Cash & Carry", contact: "Mr Pillay", phone: "046 636 0000", email: "info@gcc.co.za" },
  { key: "airtime", name: "Vodacom Airtime (Local Agent)", contact: "Mrs Khumalo", phone: "082 555 0101", email: null },
  { key: "bathurst", name: "Bathurst Eggs", contact: "Andries", phone: "046 625 0011", email: null },
];

interface ProductSpec {
  name: string;
  sku: string;
  unit: string;
  cost_cents: number;
  sell_cents: number;
  reorder: number;
  opening_qty: number;
  supplier_key: string;
  daily_range: [number, number];
}

const PRODUCTS: ProductSpec[] = [
  { name: "Albany White Bread 700g", sku: "BRD-W-700", unit: "loaf", cost_cents: 1400, sell_cents: 1800, reorder: 12, opening_qty: 60, supplier_key: "albany", daily_range: [15, 28] },
  { name: "Albany Brown Bread 700g", sku: "BRD-B-700", unit: "loaf", cost_cents: 1350, sell_cents: 1750, reorder: 10, opening_qty: 40, supplier_key: "albany", daily_range: [8, 18] },
  { name: "Coca-Cola 2L", sku: "CC-2L", unit: "bottle", cost_cents: 1600, sell_cents: 2200, reorder: 12, opening_qty: 48, supplier_key: "coca", daily_range: [3, 8] },
  { name: "Coca-Cola 330ml", sku: "CC-330", unit: "can", cost_cents: 850, sell_cents: 1200, reorder: 24, opening_qty: 96, supplier_key: "coca", daily_range: [10, 22] },
  { name: "Airtime Voucher R10", sku: "AIR-R10", unit: "voucher", cost_cents: 1000, sell_cents: 1050, reorder: 20, opening_qty: 50, supplier_key: "airtime", daily_range: [8, 14] },
  { name: "Airtime Voucher R5", sku: "AIR-R5", unit: "voucher", cost_cents: 500, sell_cents: 525, reorder: 20, opening_qty: 40, supplier_key: "airtime", daily_range: [5, 12] },
  { name: "Iwisa Maize Meal 10kg", sku: "MZE-10", unit: "bag", cost_cents: 8500, sell_cents: 10500, reorder: 5, opening_qty: 15, supplier_key: "makro", daily_range: [0, 3] },
  { name: "Sugar 2kg", sku: "SUG-2", unit: "packet", cost_cents: 3500, sell_cents: 4200, reorder: 8, opening_qty: 24, supplier_key: "makro", daily_range: [1, 4] },
  { name: "Cooking Oil 2L", sku: "OIL-2", unit: "bottle", cost_cents: 5500, sell_cents: 6800, reorder: 6, opening_qty: 18, supplier_key: "makro", daily_range: [1, 3] },
  { name: "Long Life Milk 1L", sku: "MLK-1", unit: "carton", cost_cents: 1600, sell_cents: 2000, reorder: 12, opening_qty: 36, supplier_key: "cashcarry", daily_range: [4, 10] },
  { name: "Eggs 6-pack", sku: "EGG-6", unit: "pack", cost_cents: 1800, sell_cents: 2400, reorder: 8, opening_qty: 24, supplier_key: "bathurst", daily_range: [2, 6] },
  { name: "Sunlight Washing Powder 1kg", sku: "WAS-1", unit: "packet", cost_cents: 3500, sell_cents: 4200, reorder: 5, opening_qty: 15, supplier_key: "cashcarry", daily_range: [1, 3] },
  { name: "Candles (6-pack)", sku: "CDL-6", unit: "pack", cost_cents: 2000, sell_cents: 2500, reorder: 5, opening_qty: 15, supplier_key: "cashcarry", daily_range: [1, 3] },
  { name: "Simba Chips (small)", sku: "CHP-S", unit: "packet", cost_cents: 800, sell_cents: 1000, reorder: 20, opening_qty: 60, supplier_key: "cashcarry", daily_range: [8, 15] },
  { name: "Paraffin 1L", sku: "PAR-1", unit: "litre", cost_cents: 1800, sell_cents: 2200, reorder: 10, opening_qty: 30, supplier_key: "cashcarry", daily_range: [2, 6] },
];

let _seed = 42;
function rand(): number {
  _seed = (_seed * 1664525 + 1013904223) % 4294967296;
  return _seed / 4294967296;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function dayOfWeek(ts: number): number {
  return new Date(ts).getUTCDay();
}

function demandMultiplier(ts: number): number {
  const dow = dayOfWeek(ts);
  const base = dow === 5 ? 1.4 : dow === 6 ? 1.6 : dow === 0 ? 0.7 : 1.0;
  const date = new Date(ts);
  const dom = date.getUTCDate();
  const monthEnd = date.getUTCMonth() !== new Date(ts + DAY * 3).getUTCMonth();
  const monthEndBoost = monthEnd || dom === 30 || dom === 31 ? 1.35 : 1.0;
  const sickWeek = ts >= new Date("2026-08-10T00:00:00Z").getTime() && ts < new Date("2026-08-17T00:00:00Z").getTime();
  const greatWeek = ts >= new Date("2026-09-14T00:00:00Z").getTime() && ts < new Date("2026-09-21T00:00:00Z").getTime();
  const storyMult = sickWeek ? 0.55 : greatWeek ? 1.35 : 1.0;
  const jitter = 0.85 + rand() * 0.3;
  return base * monthEndBoost * storyMult * jitter;
}

async function wipeDemoData(): Promise<void> {
  const existing = await db().execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [DEMO_EMAIL],
  });
  if (existing.rows.length === 0) return;

  console.log("Existing demo found. Wiping...");
  const userId = String(existing.rows[0].id);
  const bizRes = await db().execute({
    sql: "SELECT business_id FROM business_members WHERE user_id = ?",
    args: [userId],
  });
  if (bizRes.rows.length > 0) {
    const bizId = String(bizRes.rows[0].business_id);
    await db().execute({ sql: "DELETE FROM stock_movements WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM products WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM suppliers WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM records WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM tasks WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM goals WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM business_members WHERE business_id = ?", args: [bizId] });
    await db().execute({ sql: "DELETE FROM businesses WHERE id = ?", args: [bizId] });
  }
  await db().execute({ sql: "DELETE FROM audit_log WHERE actor_id = ?", args: [userId] });
  await db().execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
  console.log("Wiped old demo.");
}

async function main() {
  await wipeDemoData();

  const userId = uuid();
  const bizId = uuid();
  const now = nowMs();

  await db().execute({
    sql: `INSERT INTO users (id, name, email, password_hash, email_verified_at, is_demo, is_admin, created_at)
          VALUES (?, ?, ?, ?, ?, 1, 1, ?)`,
    args: [userId, "Nomsa Dlamini", DEMO_EMAIL, hashPassword(DEMO_PASSWORD), now, now],
  });

  await db().execute({
    sql: `INSERT INTO businesses (id, name, business_type, location, currency, trading_since, operating_notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      bizId, "Nomsa's Spaza", "Spaza shop", "Makhanda, Eastern Cape", "ZAR", "2023-04",
      "Cash-based. Bread, cold drinks, airtime, household staples. Composite demo business — no real trader data.",
      now,
    ],
  });

  await db().execute({
    sql: "INSERT INTO business_members (business_id, user_id, role) VALUES (?, ?, 'owner')",
    args: [bizId, userId],
  });

  const supplierIds: Record<string, string> = {};
  for (const s of SUPPLIERS) {
    const id = uuid();
    supplierIds[s.key] = id;
    await db().execute({
      sql: "INSERT INTO suppliers (id, business_id, name, contact_name, phone, email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [id, bizId, s.name, s.contact, s.phone, s.email, now],
    });
  }

  const productIds: Record<string, string> = {};
  for (const p of PRODUCTS) {
    const id = uuid();
    productIds[p.sku] = id;
    await db().execute({
      sql: "INSERT INTO products (id, business_id, name, sku, unit, cost_price_cents, selling_price_cents, reorder_threshold, supplier_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [id, bizId, p.name, p.sku, p.unit, p.cost_cents, p.sell_cents, p.reorder, supplierIds[p.supplier_key], now],
    });
  }

  console.log(`✓ ${SUPPLIERS.length} suppliers + ${PRODUCTS.length} products`);

  type PendingRecord = {
    id: string;
    kind: "sale" | "expense" | "stock_purchase" | "stock_count" | "loss";
    amount_cents: number;
    quantity: number | null;
    description: string;
    occurred_at: number;
    evidence_tier: "reported" | "document_supported" | "counter_signed";
  };
  type PendingMovement = {
    id: string;
    product_id: string;
    type: "delivery" | "sale" | "loss" | "count" | "adjustment";
    quantity_delta: number;
    observed_quantity: number | null;
    reference_record_id: string | null;
    notes: string;
    created_at: number;
  };

  const pendingRecords: PendingRecord[] = [];
  const pendingMovements: PendingMovement[] = [];

  // Opening stock
  for (const p of PRODUCTS) {
    const recId = uuid();
    pendingRecords.push({
      id: recId, kind: "stock_purchase",
      amount_cents: p.opening_qty * p.cost_cents, quantity: p.opening_qty,
      description: `Opening stock — ${p.name} (${p.opening_qty} ${p.unit}s)`,
      occurred_at: START, evidence_tier: "document_supported",
    });
    pendingMovements.push({
      id: uuid(), product_id: productIds[p.sku], type: "delivery",
      quantity_delta: p.opening_qty, observed_quantity: null,
      reference_record_id: recId, notes: "Opening stock balance",
      created_at: START,
    });
  }

  let currentDay = START;
  let dayIndex = 0;

  while (currentDay < REFERENCE) {
    const mult = demandMultiplier(currentDay);
    const dow = dayOfWeek(currentDay);
    const dom = new Date(currentDay).getUTCDate();

    // Daily sales aggregate
    let dayRevenue = 0;
    const productSales: { sku: string; qty: number }[] = [];
    for (const p of PRODUCTS) {
      const baseQty = randInt(p.daily_range[0], p.daily_range[1]);
      const qty = Math.max(0, Math.round(baseQty * mult));
      if (qty === 0) continue;
      productSales.push({ sku: p.sku, qty });
      dayRevenue += qty * p.sell_cents;
    }
    if (dayRevenue > 0) {
      const saleId = uuid();
      pendingRecords.push({
        id: saleId, kind: "sale", amount_cents: dayRevenue, quantity: null,
        description: `Daily takings — ${new Date(currentDay).toISOString().slice(0, 10)}`,
        occurred_at: currentDay,
        evidence_tier: rand() > 0.35 ? "document_supported" : "reported",
      });
      for (const sale of productSales) {
        pendingMovements.push({
          id: uuid(), product_id: productIds[sale.sku], type: "sale",
          quantity_delta: -sale.qty, observed_quantity: null,
          reference_record_id: saleId, notes: `Sold ${sale.qty}`,
          created_at: currentDay,
        });
      }
    }

    // Bread deliveries Mon-Sat
    if (dow >= 1 && dow <= 6) {
      for (const sku of ["BRD-W-700", "BRD-B-700"]) {
        const p = PRODUCTS.find((pp) => pp.sku === sku)!;
        const delQty = Math.round(randInt(20, 40) * (dow === 5 || dow === 6 ? 1.4 : 1.0));
        const recId = uuid();
        pendingRecords.push({
          id: recId, kind: "stock_purchase",
          amount_cents: delQty * p.cost_cents, quantity: delQty,
          description: `Albany delivery — ${p.name} (${delQty})`,
          occurred_at: currentDay + 6 * 3600_000, evidence_tier: "document_supported",
        });
        pendingMovements.push({
          id: uuid(), product_id: productIds[sku], type: "delivery",
          quantity_delta: delQty, observed_quantity: null,
          reference_record_id: recId, notes: "Albany Bakery delivery",
          created_at: currentDay + 6 * 3600_000,
        });
      }
    }

    // Coca-Cola weekly Monday
    if (dow === 1) {
      for (const sku of ["CC-2L", "CC-330"]) {
        const p = PRODUCTS.find((pp) => pp.sku === sku)!;
        const delQty = sku === "CC-2L" ? randInt(30, 48) : randInt(80, 120);
        const recId = uuid();
        pendingRecords.push({
          id: recId, kind: "stock_purchase",
          amount_cents: delQty * p.cost_cents, quantity: delQty,
          description: `Coca-Cola delivery — ${p.name} (${delQty})`,
          occurred_at: currentDay + 8 * 3600_000, evidence_tier: "document_supported",
        });
        pendingMovements.push({
          id: uuid(), product_id: productIds[sku], type: "delivery",
          quantity_delta: delQty, observed_quantity: null,
          reference_record_id: recId, notes: "Weekly CCBSA delivery",
          created_at: currentDay + 8 * 3600_000,
        });
      }
    }

    // Airtime Thursday
    if (dow === 4) {
      for (const sku of ["AIR-R10", "AIR-R5"]) {
        const p = PRODUCTS.find((pp) => pp.sku === sku)!;
        const delQty = sku === "AIR-R10" ? randInt(40, 60) : randInt(30, 50);
        const recId = uuid();
        pendingRecords.push({
          id: recId, kind: "stock_purchase",
          amount_cents: delQty * p.cost_cents, quantity: delQty,
          description: `Airtime restock — ${p.name} (${delQty})`,
          occurred_at: currentDay + 10 * 3600_000, evidence_tier: "document_supported",
        });
        pendingMovements.push({
          id: uuid(), product_id: productIds[sku], type: "delivery",
          quantity_delta: delQty, observed_quantity: null,
          reference_record_id: recId, notes: "Airtime agent restock",
          created_at: currentDay + 10 * 3600_000,
        });
      }
    }

    // Makro monthly (1st of month) — sized for ~30 days of sales
    if (dom === 1) {
      const makroProducts: { sku: string; qty: [number, number] }[] = [
        { sku: "MZE-10", qty: [20, 30] },
        { sku: "SUG-2", qty: [40, 60] },
        { sku: "OIL-2", qty: [25, 40] },
      ];
      for (const item of makroProducts) {
        const p = PRODUCTS.find((pp) => pp.sku === item.sku)!;
        const delQty = randInt(item.qty[0], item.qty[1]);
        const recId = uuid();
        pendingRecords.push({
          id: recId, kind: "stock_purchase",
          amount_cents: delQty * p.cost_cents, quantity: delQty,
          description: `Makro order — ${p.name} (${delQty})`,
          occurred_at: currentDay + 4 * 3600_000, evidence_tier: "document_supported",
        });
        pendingMovements.push({
          id: uuid(), product_id: productIds[item.sku], type: "delivery",
          quantity_delta: delQty, observed_quantity: null,
          reference_record_id: recId, notes: "Monthly Makro bulk order",
          created_at: currentDay + 4 * 3600_000,
        });
      }
    }

    // Cash & Carry weekly (Mondays) — matches daily sales rate so stock stays stable
    if (dow === 1) {
      const cncProducts: { sku: string; qty: [number, number] }[] = [
        { sku: "MLK-1", qty: [40, 60] },
        { sku: "WAS-1", qty: [15, 22] },
        { sku: "CDL-6", qty: [15, 22] },
        { sku: "CHP-S", qty: [60, 90] },
        { sku: "PAR-1", qty: [25, 40] },
      ];
      for (const item of cncProducts) {
        const p = PRODUCTS.find((pp) => pp.sku === item.sku)!;
        const delQty = randInt(item.qty[0], item.qty[1]);
        const recId = uuid();
        pendingRecords.push({
          id: recId, kind: "stock_purchase",
          amount_cents: delQty * p.cost_cents, quantity: delQty,
          description: `Cash & Carry — ${p.name} (${delQty})`,
          occurred_at: currentDay + 5 * 3600_000, evidence_tier: "document_supported",
        });
        pendingMovements.push({
          id: uuid(), product_id: productIds[item.sku], type: "delivery",
          quantity_delta: delQty, observed_quantity: null,
          reference_record_id: recId, notes: "Weekly Cash & Carry restock",
          created_at: currentDay + 5 * 3600_000,
        });
      }
    }

    // Eggs Mon & Thu
    if (dow === 1 || dow === 4) {
      const p = PRODUCTS.find((pp) => pp.sku === "EGG-6")!;
      const delQty = randInt(12, 24);
      const recId = uuid();
      pendingRecords.push({
        id: recId, kind: "stock_purchase",
        amount_cents: delQty * p.cost_cents, quantity: delQty,
        description: `Bathurst Eggs — ${p.name} (${delQty})`,
        occurred_at: currentDay + 7 * 3600_000, evidence_tier: "reported",
      });
      pendingMovements.push({
        id: uuid(), product_id: productIds["EGG-6"], type: "delivery",
        quantity_delta: delQty, observed_quantity: null,
        reference_record_id: recId, notes: "Farmer delivery",
        created_at: currentDay + 7 * 3600_000,
      });
    }

    // Expenses
    if (dom === 1) {
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: 150000, quantity: null,
        description: "Monthly rent to landlord", occurred_at: currentDay + 9 * 3600_000,
        evidence_tier: "reported",
      });
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: randInt(20000, 35000), quantity: null,
        description: "Taxi van hire — Makro run", occurred_at: currentDay + 3 * 3600_000,
        evidence_tier: "reported",
      });
    }
    if (dayIndex % 10 === 0) {
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: randInt(20000, 40000), quantity: null,
        description: "Prepaid electricity", occurred_at: currentDay + 10 * 3600_000,
        evidence_tier: "document_supported",
      });
    }
    if (dow === 2 || dow === 5) {
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: randInt(5000, 12000), quantity: null,
        description: "Generator petrol", occurred_at: currentDay + 14 * 3600_000,
        evidence_tier: "reported",
      });
    }
    if (dow === 1) {
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: 8000, quantity: null,
        description: "Cellphone & data", occurred_at: currentDay + 12 * 3600_000,
        evidence_tier: "reported",
      });
    }
    if (dow === 6) {
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: 15000, quantity: null,
        description: "Casual help — Saturday", occurred_at: currentDay + 17 * 3600_000,
        evidence_tier: "reported",
      });
    }
    if (dom === 25) {
      pendingRecords.push({
        id: uuid(), kind: "expense", amount_cents: 4500, quantity: null,
        description: "Bank charges", occurred_at: currentDay + 11 * 3600_000,
        evidence_tier: "document_supported",
      });
    }

    // Physical stock counts on 1st and 15th
    if (dom === 1 || dom === 15) {
      for (const p of PRODUCTS) {
        const movements = pendingMovements.filter((m) => m.product_id === productIds[p.sku] && m.type !== "count");
        const expected = movements.reduce((s, m) => s + m.quantity_delta, 0);
        let counted = expected;

        // Deliberate open variance on Airtime R10 — placed at the LAST count (Oct 15)
        // so it doesn't get overwritten by a later routine count.
        const isOct15Count =
          dom === 15 && new Date(currentDay).getUTCMonth() === 9;
        if (p.sku === "AIR-R10" && isOct15Count) {
          counted = expected - 8;
        }

        const countId = uuid();
        pendingRecords.push({
          id: countId, kind: "stock_count", amount_cents: 0, quantity: counted,
          description: `Physical count — ${p.name} (${counted} ${p.unit}s)`,
          occurred_at: currentDay + 16 * 3600_000, evidence_tier: "document_supported",
        });
        pendingMovements.push({
          id: uuid(), product_id: productIds[p.sku], type: "count",
          quantity_delta: 0, observed_quantity: counted,
          reference_record_id: countId,
          notes: `Counted ${counted}. Expected ${expected}. Variance ${counted - expected}.`,
          created_at: currentDay + 16 * 3600_000,
        });
      }
    }

    currentDay += DAY;
    dayIndex++;
  }

  // Seal all records in chronological order
  pendingRecords.sort((a, b) => a.occurred_at - b.occurred_at);
  console.log(`Sealing ${pendingRecords.length} ledger records...`);

  let head: { seq: number; canonical_hash: string } | null = null;
  const nowInsert = nowMs();

  for (const r of pendingRecords) {
    const sealed = sealRecord(head, {
      id: r.id, business_id: bizId, kind: r.kind,
      amount_cents: r.amount_cents, quantity: r.quantity,
      description: r.description, occurred_at: r.occurred_at,
      source_channel: "demo",
      status: r.kind === "stock_count" ? "reconciled" : "saved",
      evidence_tier: r.evidence_tier,
    });
    await db().execute({
      sql: `INSERT INTO records (
        id, business_id, seq, kind, amount_cents, quantity, description, occurred_at,
        source_channel, status, idempotency_key, evidence_tier,
        prev_hash, canonical_hash, signature, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        r.id, bizId, sealed.seq, sealed.kind, sealed.amount_cents, sealed.quantity,
        sealed.description, sealed.occurred_at, sealed.source_channel, sealed.status,
        null, sealed.evidence_tier, sealed.prev_hash, sealed.canonical_hash,
        sealed.signature, userId, nowInsert,
      ],
    });
    head = { seq: sealed.seq, canonical_hash: sealed.canonical_hash };
  }

  console.log(`Inserting ${pendingMovements.length} stock movements...`);
  const CHUNK = 500;
  for (let i = 0; i < pendingMovements.length; i += CHUNK) {
    const chunk = pendingMovements.slice(i, i + CHUNK);
    await db().batch(
      chunk.map((m) => ({
        sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity_delta, observed_quantity, reference_id, notes, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [m.id, bizId, m.product_id, m.type, m.quantity_delta, m.observed_quantity, m.reference_record_id, m.notes, m.created_at],
      })),
      "write"
    );
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  RICH DEMO SEEDED");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Login:        ${DEMO_EMAIL}`);
  console.log(`  Password:     ${DEMO_PASSWORD}`);
  console.log(`  Business ID:  ${bizId}`);
  console.log(`  Products:     ${PRODUCTS.length}`);
  console.log(`  Suppliers:    ${SUPPLIERS.length}`);
  console.log(`  Records:      ${pendingRecords.length}`);
  console.log(`  Stock moves:  ${pendingMovements.length}`);
  console.log(`  Date range:   ${new Date(START).toISOString().slice(0, 10)} → ${new Date(REFERENCE).toISOString().slice(0, 10)}`);
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});