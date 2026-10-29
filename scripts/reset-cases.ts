/// <reference types="node" />
import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  try {
    await db().execute("DROP TABLE IF EXISTS cases;");
    console.log("✅ Dropped old cases table.");
  } catch (e) {
    console.error("Error dropping table:", e);
  }
  process.exit(0);
}
main();