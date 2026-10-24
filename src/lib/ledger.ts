import {
  sign,
  verify,
  createHash,
  createPrivateKey,
  createPublicKey,
} from "node:crypto";

const PRIVATE_KEY = createPrivateKey({
  key: Buffer.from(process.env.ED25519_PRIVATE_KEY_B64!, "base64").toString("utf8"),
  format: "pem",
});
const PUBLIC_KEY = createPublicKey({
  key: Buffer.from(process.env.ED25519_PUBLIC_KEY_B64!, "base64").toString("utf8"),
  format: "pem",
});

export type LedgerKind =
  | "sale"
  | "expense"
  | "stock_purchase"
  | "stock_count"
  | "loss";

export interface LedgerRecord {
  id: string;
  business_id: string;
  seq: number;
  kind: LedgerKind;
  amount_cents: number;
  quantity: number | null;
  description: string;
  occurred_at: number;
  source_channel: string;
  status: string;
  evidence_tier: string;
  prev_hash: string;
  canonical_hash: string;
  signature: string;
}

const GENESIS = "GENESIS";

/** Deterministic canonical form. Sorted keys, fixed field order, no ambiguity. */
export function canonicalize(
  r: Omit<LedgerRecord, "canonical_hash" | "signature">
): string {
  const fields: Record<string, unknown> = {
    id: r.id,
    business_id: r.business_id,
    seq: r.seq,
    kind: r.kind,
    amount_cents: r.amount_cents,
    quantity: r.quantity,
    description: r.description,
    occurred_at: r.occurred_at,
    source_channel: r.source_channel,
    status: r.status,
    evidence_tier: r.evidence_tier,
    prev_hash: r.prev_hash,
  };
  return Object.keys(fields)
    .sort()
    .map((k) => `${k}=${JSON.stringify(fields[k])}`)
    .join("|");
}

export function hashRecord(
  r: Omit<LedgerRecord, "canonical_hash" | "signature">
): string {
  return createHash("sha256").update(canonicalize(r)).digest("hex");
}

export function signHash(hash: string): string {
  return sign(null, Buffer.from(hash, "utf8"), PRIVATE_KEY).toString("base64");
}

export function verifySignature(hash: string, sigB64: string): boolean {
  try {
    return verify(
      null,
      Buffer.from(hash, "utf8"),
      PUBLIC_KEY,
      Buffer.from(sigB64, "base64")
    );
  } catch {
    return false;
  }
}

/**
 * Seal a new record. Given the current head (or null for the first record),
 * computes seq, prev_hash, canonical_hash, and signature.
 */
export function sealRecord(
  prev: { seq: number; canonical_hash: string } | null,
  fields: Omit<
    LedgerRecord,
    "seq" | "prev_hash" | "canonical_hash" | "signature"
  >
): Omit<LedgerRecord, "canonical_hash" | "signature"> & {
  canonical_hash: string;
  signature: string;
} {
  const seq = prev ? prev.seq + 1 : 1;
  const prev_hash = prev ? prev.canonical_hash : GENESIS;
  const base = { ...fields, seq, prev_hash };
  const canonical_hash = hashRecord(base);
  const signature = signHash(canonical_hash);
  return { ...base, canonical_hash, signature };
}

export interface ChainCheckResult {
  ok: boolean;
  total: number;
  brokenAtSeq: number | null;
  reason: string | null;
}

/**
 * Full chain verification. Three checks per record:
 *   1. prev_hash matches the hash of the previous record
 *   2. recomputed hash matches the stored canonical_hash (catches edits)
 *   3. signature verifies against the stored canonical_hash
 */
export function verifyChain(records: LedgerRecord[]): ChainCheckResult {
  const sorted = [...records].sort((a, b) => a.seq - b.seq);
  let prevHash = GENESIS;

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];

    if (r.prev_hash !== prevHash) {
      return {
        ok: false,
        total: sorted.length,
        brokenAtSeq: r.seq,
        reason: "prev_hash mismatch — a record was inserted or removed",
      };
    }

    const recomputed = hashRecord(r);
    if (recomputed !== r.canonical_hash) {
      return {
        ok: false,
        total: sorted.length,
        brokenAtSeq: r.seq,
        reason: "hash mismatch — this record was edited after sealing",
      };
    }

    if (!verifySignature(r.canonical_hash, r.signature)) {
      return {
        ok: false,
        total: sorted.length,
        brokenAtSeq: r.seq,
        reason: "signature invalid — this record was forged or corrupted",
      };
    }

    prevHash = r.canonical_hash;
  }

  return { ok: true, total: sorted.length, brokenAtSeq: null, reason: null };
}