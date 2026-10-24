import "dotenv/config";

const BIZ = "4d077996-a2b3-4ba8-b058-ea3935523a6e";
const BASE = "http://localhost:3000";

async function post(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log("Initial verify:");
  const initial = await get(`/api/ledger/verify?business_id=${BIZ}`);
  console.log(initial);

  console.log("\nInject discrepancy:");
  console.log(await post("/api/judge/inject-discrepancy", { business_id: BIZ }));

  console.log("\nReconcile after injection:");
  const afterInject = await get(`/api/reconcile?business_id=${BIZ}`);
  console.log("Variance:", afterInject.stock.variance);

  console.log("\nTamper with a record:");
  console.log(await post("/api/judge/tamper", { business_id: BIZ }));

  console.log("\nVerify after tampering:");
  console.log(await get(`/api/ledger/verify?business_id=${BIZ}`));

  console.log("\nReset demo:");
  console.log(await post("/api/judge/reset", { business_id: BIZ }));

  console.log("\nVerify after reset:");
  console.log(await get(`/api/ledger/verify?business_id=${BIZ}`));
}

main().catch((e) => { console.error(e); process.exit(1); });