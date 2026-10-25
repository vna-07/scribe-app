"use client";

import { useState, useEffect } from "react";

export default function SuppliersTab({ businessId }: { businessId: string }) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);

  const fetchSuppliers = async () => {
    const res = await fetch(`/api/suppliers?business_id=${businessId}`);
    if (res.ok) setSuppliers(await res.json());
  };

  useEffect(() => { fetchSuppliers(); }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        business_id: businessId,
        name: form.name,
        contact_name: form.contact,
        phone: form.phone,
        email: form.email
      }),
    });
    setShowAdd(false);
    setForm({ name: "", contact: "", phone: "", email: "" });
    fetchSuppliers();
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Supplier Directory</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Manage vendors and contact details.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-[#5B5BE0] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#4B4FC9]">
          + Add Supplier
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-4">No suppliers saved yet.</p>
          <button onClick={() => setShowAdd(true)} className="text-sm font-bold text-[#5B5BE0] hover:underline">Add your first supplier</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-5 shadow-sm">
              <h3 className="font-bold text-[#14173F] dark:text-white text-lg mb-1">{s.name}</h3>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-3">{s.contact_name || "No contact person"}</p>
              <div className="space-y-1 text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
                {s.phone && <p>📞 {s.phone}</p>}
                {s.email && <p>✉️ {s.email}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-[#14173F]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-6">Add Supplier</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Supplier Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="e.g. Albany Bakery" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Contact Person</label>
                <input value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="e.g. John" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="082..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="john@..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">Save Supplier</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}