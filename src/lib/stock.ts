import { db } from "./db";

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  cost_price_cents: number | null;
  selling_price_cents: number | null;
  reorder_threshold: number;
}

export interface ProductWithStock extends Product {
  stock_on_hand: number;
}

export async function getProductsWithStock(businessId: string): Promise<ProductWithStock[]> {
  // We use a LEFT JOIN and SUM to calculate the exact balance from the movement ledger
  const res = await db().execute({
    sql: `
      SELECT 
        p.*, 
        COALESCE(SUM(m.quantity_delta), 0) as stock_on_hand
      FROM products p
      LEFT JOIN stock_movements m ON p.id = m.product_id
      WHERE p.business_id = ?
      GROUP BY p.id
      ORDER BY p.name ASC
    `,
    args: [businessId],
  });

  return res.rows.map(r => ({
    id: String(r.id),
    name: String(r.name),
    sku: r.sku ? String(r.sku) : null,
    unit: String(r.unit),
    cost_price_cents: r.cost_price_cents ? Number(r.cost_price_cents) : null,
    selling_price_cents: r.selling_price_cents ? Number(r.selling_price_cents) : null,
    reorder_threshold: Number(r.reorder_threshold),
    stock_on_hand: Number(r.stock_on_hand),
  }));
}

export async function getStockMovements(businessId: string, productId?: string) {
  const sql = productId 
    ? "SELECT * FROM stock_movements WHERE business_id = ? AND product_id = ? ORDER BY created_at DESC LIMIT 50"
    : "SELECT * FROM stock_movements WHERE business_id = ? ORDER BY created_at DESC LIMIT 50";
  
  const args = productId ? [businessId, productId] : [businessId];
  const res = await db().execute({ sql, args });
  
  return res.rows.map(r => ({
    ...r,
    quantity_delta: Number(r.quantity_delta),
    created_at: Number(r.created_at)
  }));
}