import "dotenv/config";
import { generateKeyPairSync } from "node:crypto";

// Tests should run on a fresh machine with no .env. Generate an ephemeral
// Ed25519 key pair for this process only — never commit real keys.
if (!process.env.ED25519_PRIVATE_KEY_B64 || !process.env.ED25519_PUBLIC_KEY_B64) {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");

  // Base64 of PKCS8 DER. If ledger.ts expects base64-of-PEM instead,
  // swap `format: "der"` for `format: "pem"` and drop the Buffer.from wrap.
  process.env.ED25519_PRIVATE_KEY_B64 = privateKey
    .export({ type: "pkcs8", format: "der" })
    .toString("base64");
  process.env.ED25519_PUBLIC_KEY_B64 = publicKey
    .export({ type: "spki", format: "der" })
    .toString("base64");

  console.log("[test] No ED25519 keys in env — generated an ephemeral pair for this run.");
}