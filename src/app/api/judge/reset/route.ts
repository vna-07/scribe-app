import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { assertDemoBusiness } from "@/lib/demo-guard";

export async function POST(req: NextRequest) {
  try {
    const { business_id } = await req.json();
    if (!business_id) {
      return NextResponse.json({ error: "business_id required" }, { status: 400 });
    }

    try {
      await assertDemoBusiness(business_id);
    } catch (e: any) {
      return NextResponse.json({ error: "Forbidden" }, { status: e.status ?? 403 });
    }

    // Load the snapshot
    const snapRes = await db().execute({
      sql: "SELECT * FROM demo_snapshots WHERE business_id = ? LIMIT 1",
      args: [business_id],
    });

    if (snapRes.rows.length === 0) {
      return NextResponse.json(
        { error: "No snapshot found. Run `node scripts/snapshot-demo.mjs` to create one." },
        { status: 404 }
      );
    }

    const snap = snapRes.rows[0] as any;
    const records: any[] = JSON.parse(String(snap.records_json));
    const movements: any[] = JSON.parse(String(snap.movements_json));
    const products: any[] = JSON.parse(String(snap.products_json));
    const suppliers: any[] = JSON.parse(String(snap.suppliers_json));

    // Wipe current state
    await db().execute({ sql: "DELETE FROM stock_movements WHERE business_id = ?", args: [business_id] });
    await db().execute({ sql: "DELETE FROM records WHERE business_id = ?", args: [business_id] });
    await db().execute({ sql: "DELETE FROM products WHERE business_id = ?", args: [business_id] });
    await db().execute({ sql: "DELETE FROM suppliers WHERE business_id = ?", args: [business_id] });

    // Restore in bulk
    if (suppliers.length > 0) {
      await db().batch(
        suppliers.map((s) => ({
          sql: `INSERT INTO suppliers (id, business_id, name, contact_name, phone, email, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [s.id, s.business_id, s.name, s.contact_name, s.phone, s.email, s.created_at],
        })),
        "write"
      );
    }

    if (products.length > 0) {
      await db().batch(
        products.map((p) => ({
          sql: `INSERT INTO products (id, business_id, name, sku, unit, cost_price_cents, selling_price_cents, reorder_threshold, supplier_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id, p.business_id, p.name, p.sku, p.unit,
            p.cost_price_cents, p.selling_price_cents, p.reorder_threshold,
            p.supplier_id, p.created_at,
          ],
        })),
        "write"
      );
    }

    // Records — ordered by seq so the chain stays valid
    records.sort((a, b) => Number(a.seq) - Number(b.seq));
    const CHUNK = 500;
    for (let i = 0; i < records.length; i += CHUNK) {
      const chunk = records.slice(i, i + CHUNK);
      await db().batch(
        chunk.map((r) => ({
          sql: `INSERT INTO records (
            id, business_id, seq, kind, amount_cents, quantity, description, occurred_at,
            source_channel, status, idempotency_key, evidence_tier,
            prev_hash, canonical_hash, signature, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            r.id, r.business_id, r.seq, r.kind, r.amount_cents, r.quantity,
            r.description, r.occurred_at, r.source_channel, r.status,
            r.idempotency_key, r.evidence_tier,
            r.prev_hash, r.canonical_hash, r.signature, r.created_by, r.created_at,
          ],
        })),
        "write"
      );
    }

    // Movements
    for (let i = 0; i < movements.length; i += CHUNK) {
      const chunk = movements.slice(i, i + CHUNK);
      await db().batch(
        chunk.map((m) => ({
          sql: `INSERT INTO stock_movements (id, business_id, product_id, type, quantity_delta, observed_quantity, reference_id, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            m.id, m.business_id, m.product_id, m.type, m.quantity_delta,
            m.observed_quantity, m.reference_id, m.notes, m.created_at,
          ],
        })),
        "write"
      );
    }

    // Audit trail
    await db().execute({
      sql: "INSERT INTO audit_log (id, actor_id, business_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        uuid(),
        null,
        business_id,
        "DEMO_RESTORED",
        `Restored ${records.length} records and ${movements.length} movements from snapshot`,
        nowMs(),
      ],
    });

    return NextResponse.json({
      ok: true,
      restored: {
        records: records.length,
        movements: movements.length,
        products: products.length,
        suppliers: suppliers.length,
      },
    });
  } catch (error) {
    console.error("[judge/reset] error:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}