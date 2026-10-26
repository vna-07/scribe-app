import { db } from "./db";
import { loadBusinessRecords } from "./demo-seed";
import { verifyChain } from "./ledger";
import { reconcileStock, revenueRange } from "./reconcile";
import { consistencyScore } from "./score";
import { getBusinessStockState, type BusinessStockState } from "./stock-state";

export interface DemoData {
  businessId: string;
  businessName: string;
  businessLocation: string;
  recordCount: number;
  stock: ReturnType<typeof reconcileStock>;
  stockState: BusinessStockState;
  revenue: ReturnType<typeof revenueRange>;
  score: ReturnType<typeof consistencyScore>;
  chain: ReturnType<typeof verifyChain>;
  chartRecords: Array<{
    seq: number;
    kind: string;
    description: string;
    amount_cents: number;
    quantity: number | null;
    occurred_at: number;
    evidence_tier: string;
    status: string;
  }>;
  recentRecords: Array<{
    seq: number;
    kind: string;
    description: string;
    amount_cents: number;
    quantity: number | null;
    occurred_at: number;
    evidence_tier: string;
    status: string;
    canonical_hash: string;
    prev_hash: string;
  }>;
}

export async function loadDemoData(businessId: string): Promise<DemoData | null> {
  const bizRes = await db().execute({
    sql: "SELECT name, location FROM businesses WHERE id = ?",
    args: [businessId],
  });
  if (bizRes.rows.length === 0) return null;

  const records = await loadBusinessRecords(businessId);
  const stockState = await getBusinessStockState(businessId);

  const toRow = (r: any) => ({
    seq: r.seq,
    kind: r.kind,
    description: r.description,
    amount_cents: r.amount_cents,
    quantity: r.quantity,
    occurred_at: r.occurred_at,
    evidence_tier: r.evidence_tier,
    status: r.status,
  });

  return {
    businessId,
    businessName: String(bizRes.rows[0].name),
    businessLocation: String(bizRes.rows[0].location),
    recordCount: records.length,
    stock: reconcileStock(records),
    stockState,
    revenue: revenueRange(records),
    score: consistencyScore(records),
    chain: verifyChain(records),
    chartRecords: [...records]
      .sort((a, b) => b.occurred_at - a.occurred_at)
      .slice(0, 500)
      .map(toRow),
    recentRecords: records.slice(-15).reverse().map((r) => ({
      ...toRow(r),
      canonical_hash: r.canonical_hash,
      prev_hash: r.prev_hash,
    })),
  };
}

export async function findDemoBusinessId(): Promise<string | null> {
  const res = await db().execute({
    sql: `SELECT bm.business_id FROM business_members bm
          JOIN users u ON u.id = bm.user_id
          WHERE u.is_demo = 1 LIMIT 1`,
  });
  return res.rows[0] ? String(res.rows[0].business_id) : null;
}