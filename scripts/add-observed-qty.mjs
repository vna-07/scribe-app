import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

try {
  await client.execute("ALTER TABLE stock_movements ADD COLUMN observed_quantity INTEGER");
  console.log("✓ observed_quantity column added");
} catch (err) {
  const msg = String(err?.message || "");
  if (msg.includes("duplicate column")) {
    console.log("✓ observed_quantity already exists — nothing to do");
  } else {
    console.error("✗ Failed:", msg);
    process.exit(1);
  }
}

// Verify all expected columns exist
const cols = await client.execute("PRAGMA table_info(stock_movements)");
console.log("stock_movements columns:", cols.rows.map((r) => r.name).join(", "));