import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { getProductsWithStock } from "@/lib/stock";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

  const products = await getProductsWithStock(businessId);
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, business_id } = body;

    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    if (action === "create_product") {
      const id = uuid();
      await db().execute({
        sql: `INSERT INTO products (id, business_id, name, sku, unit, cost_price_cents, selling_price_cents, reorder_threshold, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, business_id, body.name, body.sku || null, body.unit || "unit",
          body.cost_price_cents || null, body.selling_price_cents || null,
          body.reorder_threshold || 0, nowMs()
        ],
      });
      return NextResponse.json({ ok: true, id });
    }

    if (action === "log_movement") {
      const id = uuid();
      // We do NOT update the product balance directly. We just log the movement.
      await db().execute({
        sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity_delta, reference_id, notes, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, business_id, body.product_id, body.type, body.quantity_delta,
          body.reference_id || null, body.notes || null, nowMs()
        ],
      });
      return NextResponse.json({ ok: true, id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}