import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "src", "lib", "schema.sql");
const sql = readFileSync(schemaPath, "utf8");

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

// Split into individual statements
const statements = sql
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

let applied = 0;
let skipped = 0;
let failed = 0;

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    applied++;
  } catch (err) {
    const msg = String(err?.message || "");
    // Idempotency: if the object already exists, it's fine
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate column") ||
      msg.includes("duplicate key")
    ) {
      skipped++;
    } else {
      // Real failure — log and keep going (don't abort the whole batch)
      console.error(`✗ Statement failed: ${stmt.slice(0, 120)}...`);
      console.error(`  Reason: ${msg}`);
      failed++;
    }
  }
}

console.log(`\nSchema push complete:`);
console.log(`  Applied: ${applied}`);
console.log(`  Skipped (already exist): ${skipped}`);
console.log(`  Failed:  ${failed}`);

const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
);
console.log(`\nTables: ${tables.rows.map((r) => r.name).join(", ")}`);

if (failed > 0) process.exit(1);