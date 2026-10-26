"use client";

import { useState } from "react";

interface ReorderModalProps {
  businessId: string;
  product: any; // ProductState: { id, name, expected, reorder_threshold, supplier_name, cost_price_cents }
  onClose: () => void;
  onComplete: () => Promise<void>; // refresh parent data; must NOT unmount this modal
}

export default function ReorderModal({ businessId, product, onClose, onComplete }: ReorderModalProps) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // ProductState uses `expected` for on-hand quantity, not `stock_on_hand`.
  const onHand = Number(product.expected) || 0;
  const threshold = Number(product.reorder_threshold) || 0;

  // Standard reorder rule: restock back to 2x the threshold (a healthy buffer)
  const suggestedQty = Math.max(10, (threshold * 2) - onHand);
  const estimatedCost = product.cost_price_cents
    ? (product.cost_price_cents * suggestedQty) / 100
    : 0;

  const [draft, setDraft] = useState(
    `Hi ${product.supplier_name || "Supplier"},\n\nI need to place an order for ${product.name}.\n\nQuantity: ${suggestedQty}\nCurrent stock is running low (${onHand} remaining).\n\nPlease confirm the availability and the total price.\n\nThanks,\nNomsa`
  );

  const handleSend = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create_goal",
          business_id: businessId,
          title: `Purchase Order: ${product.name}`,
          description: draft,
          target_value: null,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await onComplete();  // refresh dashboard data in the background
      setSent(true);       // show success screen (parent doesn't unmount us)
    } catch (e) {
      alert("Failed to save draft. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#14173F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#47745D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#47745D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white mb-2">Draft Saved</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">
              The order request has been saved to your Growth Studio. In production, this would send via your connected email.
            </p>
            <button onClick={onClose} className="w-full py-3 bg-[#14173F] dark:bg-[#5B5BE0] text-white font-bold rounded-xl">
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Draft Purchase Order</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Review the suggested order before saving.</p>

            <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[#14173F] dark:text-white">{product.name}</span>
                <span className="text-xs font-bold text-[#D99A00] bg-[#FFF0C4] dark:bg-[#4A3B10] px-2 py-1 rounded-full">Low Stock</span>
              </div>
              <div className="flex justify-between text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">
                <span>Current stock: {onHand} units</span>
                <span>Threshold: {threshold}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#5B5BE0] dark:text-[#A9AEFF] mt-2">
                <span>Suggested order: {suggestedQty} units</span>
                <span>Est. Cost: R{estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-2">Email Draft</label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl p-4 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={busy}
                className="flex-[2] py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50 transition-colors shadow-md"
              >
                {busy ? "Saving..." : "Save Draft"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}