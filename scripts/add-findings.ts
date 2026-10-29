/// <reference types="node" />
import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  try {
    await db().execute("ALTER TABLE cases ADD COLUMN findings TEXT;");
    console.log("✅ Successfully added 'findings' column to cases table.");
  } catch (e: any) {
    if (e.message.includes("duplicate column name")) {
      console.log("ℹ️ 'findings' column already exists. Nothing to do.");
    } else {
      console.error("❌ Error:", e);
    }
  }
  process.exit(0);
}

main();