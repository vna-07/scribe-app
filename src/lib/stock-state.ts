import { db } from "./db";

export interface ProductState {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  sell_price_cents: number;
  cost_price_cents: number | null;
  reorder_threshold: number;
  supplier_name?: string | null;
  expected: number;
  counted: number | null;
  variance: number | null;
  status: "reconciled" | "open" | "no_count";
}

export interface BusinessStockState {
  products: ProductState[];
  total_products: number;
  with_variance: number;
  open_variances: number;
  total_expected_units: number;
  total_counted_units: number | null;
}

export async function getBusinessStockState(businessId: string): Promise<BusinessStockState> {
  const productsRes = await db().execute({
    sql: `SELECT p.id, p.name, p.sku, p.unit, p.selling_price_cents, p.cost_price_cents, p.reorder_threshold, s.name as supplier_name
          FROM products p
          LEFT JOIN suppliers s ON p.supplier_id = s.id
          WHERE p.business_id = ? ORDER BY p.name ASC`,
    args: [businessId],
  });

  const movementsRes = await db().execute({
    sql: `SELECT product_id, type, quantity_delta, observed_quantity, created_at 
          FROM stock_movements 
          WHERE business_id = ? 
          ORDER BY created_at ASC, id ASC`,
    args: [businessId],
  });

  const products: ProductState[] = productsRes.rows.map((p: any) => {
    const movements = movementsRes.rows.filter((m: any) => m.product_id === p.id);

    let runningExpected = 0;
    // Track expected at the moment of the latest count, not the current expected.
    let lastCountSnapshot: { qty: number; expected_at_count: number } | null = null;

    for (const m of movements) {
      const delta = Number(m.quantity_delta);
      if (m.type === "count") {
        const observed = m.observed_quantity != null ? Number(m.observed_quantity) : null;
        if (observed !== null) {
          lastCountSnapshot = { qty: observed, expected_at_count: runningExpected };
        }
      } else {
        runningExpected += delta;
      }
    }

    const counted = lastCountSnapshot?.qty ?? null;
    const variance =
      lastCountSnapshot !== null ? counted! - lastCountSnapshot.expected_at_count : null;

    let status: ProductState["status"] = "no_count";
    if (counted !== null) {
      status = variance === 0 ? "reconciled" : "open";
    }

    return {
      id: String(p.id),
      name: String(p.name),
      sku: p.sku ? String(p.sku) : null,
      unit: String(p.unit),
      sell_price_cents: Number(p.selling_price_cents) || 0,
      cost_price_cents: p.cost_price_cents ? Number(p.cost_price_cents) : null,
      reorder_threshold: Number(p.reorder_threshold) || 0,
      supplier_name: p.supplier_name ? String(p.supplier_name) : null,
      expected: runningExpected,
      counted,
      variance,
      status,
    };
  });

  const withVariance = products.filter((p) => p.variance !== null && p.variance !== 0);

  return {
    products,
    total_products: products.length,
    with_variance: withVariance.length,
    open_variances: withVariance.length,
    total_expected_units: products.reduce((s, p) => s + p.expected, 0),
    total_counted_units: products.some((p) => p.counted !== null)
      ? products.reduce((s, p) => s + (p.counted ?? 0), 0)
      : null,
  };
}