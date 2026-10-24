import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");

const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString();

// PEM contains newlines — encode them so .env parsers don't choke.
const enc = (s) => Buffer.from(s, "utf8").toString("base64");

console.log("\nAdd these two lines to .env.local:\n");
console.log(`ED25519_PRIVATE_KEY_B64=${enc(privatePem)}`);
console.log(`ED25519_PUBLIC_KEY_B64=${enc(publicPem)}`);
console.log("");