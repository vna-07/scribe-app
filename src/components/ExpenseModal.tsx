"use client";

import { useState } from "react";

export default function ExpenseModal({ businessId, onComplete, onClose }: { businessId: string, onComplete: () => void, onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          amount_cents: Math.round(parseFloat(amount) * 100),
          description
        }),
      });
      onComplete();
      onClose();
    } catch {
      alert("Failed to record expense.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#14173F]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1A1F52] w-full max-w-sm rounded-[28px] p-8 shadow-2xl">
        <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Record Expense</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Log money spent on rent, transport, or utilities.</p>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">What was it for?</label>
            <input required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="e.g. Generator petrol" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Amount (R)</label>
            <input required type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" placeholder="0.00" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
          <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#D99A00] text-white font-bold rounded-xl hover:bg-[#C28A00] disabled:opacity-50">
            {busy ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}