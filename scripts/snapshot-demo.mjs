import { createClient } from "@libsql/client";
import "dotenv/config";

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scribe.co.za";
const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

async function main() {
  // Find the demo business
  const userRes = await client.execute({
    sql: "SELECT id FROM users WHERE email = ? AND is_demo = 1 LIMIT 1",
    args: [DEMO_EMAIL],
  });
  if (userRes.rows.length === 0) {
    console.error("No demo user found. Run seed-demo.ts first.");
    process.exit(1);
  }
  const userId = String(userRes.rows[0].id);

  const bizRes = await client.execute({
    sql: "SELECT business_id FROM business_members WHERE user_id = ? LIMIT 1",
    args: [userId],
  });
  if (bizRes.rows.length === 0) {
    console.error("Demo user has no business.");
    process.exit(1);
  }
  const bizId = String(bizRes.rows[0].business_id);

  console.log(`Snapshotting business ${bizId}...`);

  // Read every relevant table
  const records = await client.execute({
    sql: "SELECT * FROM records WHERE business_id = ? ORDER BY seq ASC",
    args: [bizId],
  });
  const movements = await client.execute({
    sql: "SELECT * FROM stock_movements WHERE business_id = ?",
    args: [bizId],
  });
  const products = await client.execute({
    sql: "SELECT * FROM products WHERE business_id = ?",
    args: [bizId],
  });
  const suppliers = await client.execute({
    sql: "SELECT * FROM suppliers WHERE business_id = ?",
    args: [bizId],
  });

  console.log(`  records: ${records.rows.length}`);
  console.log(`  movements: ${movements.rows.length}`);
  console.log(`  products: ${products.rows.length}`);
  console.log(`  suppliers: ${suppliers.rows.length}`);

  const snapshotId = crypto.randomUUID();
  const now = Date.now();

  // Wipe any previous snapshot for this business
  await client.execute({
    sql: "DELETE FROM demo_snapshots WHERE business_id = ?",
    args: [bizId],
  });

  // Save new snapshot
  await client.execute({
    sql: `INSERT INTO demo_snapshots (id, business_id, records_json, movements_json, products_json, suppliers_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      snapshotId,
      bizId,
      JSON.stringify(records.rows),
      JSON.stringify(movements.rows),
      JSON.stringify(products.rows),
      JSON.stringify(suppliers.rows),
      now,
    ],
  });

  console.log(`\n✓ Snapshot saved: ${snapshotId}`);
  console.log(`  Restore endpoint: POST /api/judge/reset`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});