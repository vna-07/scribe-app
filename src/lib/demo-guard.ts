import { db } from "./db";

/**
 * Only demo businesses can call Judge Mode endpoints.
 * Real traders cannot inject fake losses into their own records.
 */
export async function assertDemoBusiness(businessId: string): Promise<void> {
  const res = await db().execute({
    sql: `SELECT 1 FROM business_members bm
          JOIN users u ON u.id = bm.user_id
          WHERE bm.business_id = ? AND u.is_demo = 1
          LIMIT 1`,
    args: [businessId],
  });
  if (res.rows.length === 0) {
    throw Object.assign(new Error("Not a demo business"), { status: 403 });
  }
}