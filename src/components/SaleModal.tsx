"use client";

import { useState, useEffect } from "react";
import { rands } from "@/lib/format";

export default function SaleModal({ businessId, onComplete, onClose }: { businessId: string, onComplete: () => void, onClose: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/stock?business_id=${businessId}`)
      .then(r => r.json())
      .then(data => setProducts(data));
  }, [businessId]);

  const product = products.find(p => p.id === selectedProduct);
  const totalCents = product && product.selling_price_cents 
    ? product.selling_price_cents * parseInt(quantity || "0")
    : 0;

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setBusy(true);
    
    try {
      await fetch("/api/sales", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          product_id: product.id,
          quantity: parseInt(quantity),
          total_amount_cents: totalCents
        }),
      });
      onComplete(); // Refresh dashboard
      onClose();
    } catch {
      alert("Failed to record sale.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#14173F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={handleSale} className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
        <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Record Sale</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">This will update the ledger and deduct stock automatically.</p>
        
        {products.length === 0 ? (
          <div className="text-center py-6 text-sm text-[#5A5F8C]">
            No products found. Add a product in the Stock tab first.
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Product</label>
                <select 
                  required 
                  value={selectedProduct} 
                  onChange={e => setSelectedProduct(e.target.value)} 
                  className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock_on_hand <= 0}>
                      {p.name} {p.stock_on_hand <= 0 ? "(Out of stock)" : `(${p.stock_on_hand} left)`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Quantity</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  max={product?.stock_on_hand || 100}
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)} 
                  className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" 
                />
              </div>

              {product && (
                <div className="bg-[#E1E4F7] dark:bg-[#2A3070] p-4 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Total Amount</span>
                  <span className="font-extrabold text-xl text-[#14173F] dark:text-white tabular-nums">{rands(totalCents)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy || !product || parseInt(quantity) > (product?.stock_on_hand || 0)} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">
                {busy ? "Processing..." : "Sell Product"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}