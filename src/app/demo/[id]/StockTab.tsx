"use client";

import { useState, useEffect } from "react";
import { rands } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  cost_price_cents: number | null;
  stock_on_hand: number;
  reorder_threshold: number;
}

export default function StockTab({ businessId, onRefresh }: { businessId: string, onRefresh: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDeliver, setShowDeliver] = useState<string | null>(null); // product_id
  const [showCount, setShowCount] = useState<Product | null>(null);
  
  // Form states
  const [form, setForm] = useState({ name: "", sku: "", unit: "unit", cost: "" });
  const [delForm, setDelForm] = useState({ qty: "", notes: "" });
  const [countForm, setCountForm] = useState({ actual_qty: "" });
  const [busy, setBusy] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch(`/api/stock?business_id=${businessId}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "create_product",
        business_id: businessId,
        name: form.name,
        sku: form.sku,
        unit: form.unit,
        cost_price_cents: form.cost ? Math.round(parseFloat(form.cost) * 100) : null,
      }),
    });
    setShowAdd(false);
    setForm({ name: "", sku: "", unit: "unit", cost: "" });
    fetchProducts();
    setBusy(false);
  };

  const handleDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeliver) return;
    setBusy(true);
    await fetch("/api/stock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "log_movement",
        business_id: businessId,
        product_id: showDeliver,
        type: "delivery",
        quantity_delta: parseInt(delForm.qty),
        notes: delForm.notes,
      }),
    });
    setShowDeliver(null);
    setDelForm({ qty: "", notes: "" });
    fetchProducts();
    onRefresh(); // Tell the dashboard to update the variance count
    setBusy(false);
  };

  const handleCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCount) return;
    setBusy(true);
    
    const expected = showCount.stock_on_hand;
    const actual = parseInt(countForm.actual_qty);
    const variance = actual - expected;

    // 1. Log the physical count observation
    await fetch("/api/stock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "log_movement",
        business_id: businessId,
        product_id: showCount.id,
        type: "count",
        quantity_delta: 0,
        observed_quantity: actual,
        notes: `Physical count: ${actual} units (Expected: ${expected})`,
      }),
    });

    // 2. If there is a variance, log an adjustment to fix the ledger
    if (variance !== 0) {
      await fetch("/api/stock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "log_movement",
          business_id: businessId,
          product_id: showCount.id,
          type: "adjustment",
          quantity_delta: variance,
          notes: `Auto-adjustment to match physical count of ${actual}`,
        }),
      });
    }

    setShowCount(null);
    setCountForm({ actual_qty: "" });
    fetchProducts();
    onRefresh();
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Product Catalogue</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Movement-based inventory.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#5B5BE0] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#4B4FC9] transition-colors">
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/50 dark:bg-[#1A1F52] rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-4">No products tracked yet.</p>
          <button onClick={() => setShowAdd(true)} className="text-sm font-bold text-[#5B5BE0] hover:underline">Add your first product</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4A4F7A] dark:text-[#C5C9F5] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4 text-center">On Hand</th>
                <th className="p-4 text-right">Cost</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E4F7] dark:divide-[#2A3070]">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-[#F1F2FF]/50 dark:hover:bg-[#2A3070]/30 transition-colors">
                  <td className="p-4 font-bold text-[#14173F] dark:text-white">{p.name}</td>
                  <td className="p-4 text-[#4A4F7A] dark:text-[#C5C9F5]">{p.sku || "—"}</td>
                  <td className="p-4 text-center tabular-nums">
                    <span className={`px-3 py-1 rounded-full font-bold ${p.stock_on_hand <= p.reorder_threshold ? "bg-[#FFF0C4] text-[#D99A00]" : "bg-[#E1E4F7] dark:bg-[#2A3070] text-[#14173F] dark:text-white"}`}>
                      {p.stock_on_hand} {p.unit}s
                    </span>
                  </td>
                  <td className="p-4 text-right tabular-nums text-[#4A4F7A] dark:text-[#C5C9F5]">{p.cost_price_cents ? rands(p.cost_price_cents) : "—"}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => setShowDeliver(p.id)} className="text-xs font-bold text-[#5B5BE0] hover:underline bg-[#F1F2FF] dark:bg-[#2A3070] px-3 py-1.5 rounded-lg">
                      + Receive
                    </button>
                    <button onClick={() => { setShowCount(p); setCountForm({ actual_qty: p.stock_on_hand.toString() }); }} className="text-xs font-bold text-[#D99A00] hover:underline bg-[#FFF0C4] dark:bg-[#4A3B10] px-3 py-1.5 rounded-lg">
                      Count
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ADD PRODUCT MODAL ─── */}
      {showAdd && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-6">Add Product</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Product Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. White Bread" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">SKU (Optional)</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="SKU-123" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Unit</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. loaf, bottle, kg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Cost Price (R) (Optional)</label>
                <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="0.00" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">Save Product</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── RECEIVE STOCK MODAL ─── */}
      {showDeliver && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDelivery} className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Receive Stock</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Log a delivery for this product.</p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Quantity Received</label>
                <input required type="number" min="1" value={delForm.qty} onChange={e => setDelForm({...delForm, qty: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Reference / Notes</label>
                <input value={delForm.notes} onChange={e => setDelForm({...delForm, notes: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. Invoice #1234" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDeliver(null)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">Log Delivery</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── STOCK COUNT MODAL ─── */}
      {showCount && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCountSubmit} className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Stock Count</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">
              System says you have <strong className="text-[#14173F] dark:text-white">{showCount.stock_on_hand} {showCount.unit}s</strong>. What is the actual physical count?
            </p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Actual Quantity on Shelf</label>
                <input required type="number" min="0" value={countForm.actual_qty} onChange={e => setCountForm({ actual_qty: e.target.value })} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" />
              </div>
              {countForm.actual_qty && parseInt(countForm.actual_qty) !== showCount.stock_on_hand && (
                <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] p-3 rounded-lg border border-[#D99A00]">
                  <p className="text-xs font-bold text-[#D99A00] dark:text-[#F2B84B]">
                    Variance detected: {parseInt(countForm.actual_qty) - showCount.stock_on_hand > 0 ? "+" : ""}
                    {parseInt(countForm.actual_qty) - showCount.stock_on_hand} units
                  </p>
                  <p className="text-[10px] text-[#1D2260] dark:text-[#C5C9F5] mt-1">
                    Confirming this will log a stock adjustment to fix your books and record the audit trail.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCount(null)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#D99A00] text-white font-bold rounded-xl hover:bg-[#C28A00] disabled:opacity-50">
                {busy ? "Recording..." : "Confirm Count"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}