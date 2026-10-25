"use client";

import { useState, useEffect } from "react";
import { rands } from "@/lib/format";

export default function OpportunitiesTab({ businessId }: { businessId: string }) {
  const [activeTab, setActiveTab] = useState<"start" | "expand" | "funding">("start");
  const [plans, setPlans] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal: "", location: "", capital: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/plans?business_id=${businessId}`)
      .then(r => r.json())
      .then(d => setPlans(d));
  }, [businessId]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/plans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        business_id: businessId,
        type: activeTab === "funding" ? "expand" : activeTab,
        goal: form.goal,
        location: form.location,
        capital_available_cents: form.capital ? Math.round(parseFloat(form.capital) * 100) : null,
      }),
    });
    setShowForm(false);
    setForm({ goal: "", location: "", capital: "" });
    const newPlans = await fetch(`/api/plans?business_id=${businessId}`).then(r => r.json());
    setPlans(newPlans);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Business Launch Studio</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Plan, fund, and expand your operations.</p>
        </div>
      </div>

      {/* Top 3 Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => { setActiveTab("start"); setShowForm(false); }} className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "start" ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF]"}`}>
          <div className="w-10 h-10 rounded-xl bg-[#5B5BE0] text-white flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Start a Business</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Build a roadmap from idea to launch.</p>
        </button>

        <button onClick={() => { setActiveTab("expand"); setShowForm(false); }} className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "expand" ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF]"}`}>
          <div className="w-10 h-10 rounded-xl bg-[#47745D] text-white flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Expand My Business</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Scale existing operations and revenue.</p>
        </button>

        <button onClick={() => { setActiveTab("funding"); setShowForm(false); }} className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "funding" ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF]"}`}>
          <div className="w-10 h-10 rounded-xl bg-[#D99A00] text-white flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Find Funding</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Match with grants and support.</p>
        </button>
      </div>

      {/* Active Area */}
      {activeTab !== "funding" && (
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-[#14173F] dark:text-white">
              {activeTab === "start" ? "My Launch Plans" : "My Expansion Plans"}
            </h3>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#5B5BE0] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#4B4FC9]">
              + New Plan
            </button>
          </div>

          {plans.filter(p => p.type === activeTab).length === 0 ? (
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] text-center py-8">No plans yet. Click "+ New Plan" to start the interview.</p>
          ) : (
            <div className="space-y-4">
              {plans.filter(p => p.type === activeTab).map(plan => (
                <div key={plan.id} className="p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] bg-[#F8F9FF] dark:bg-[#14173F] flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[#14173F] dark:text-white">{plan.goal}</h4>
                    <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mt-1">
                      {plan.location || "No location"} · Capital: {plan.capital_available_cents ? rands(plan.capital_available_cents) : "Unknown"}
                    </p>
                  </div>
                  <button className="text-xs font-bold text-[#5B5BE0] hover:underline">View Roadmap</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Funding Directory (Static for now) */}
      {activeTab === "funding" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] px-2 py-1 rounded">Grant</span>
            </div>
            <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg leading-tight mb-1">NYDA Grant Programme</h3>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mb-4">National Youth Development Agency</p>
            <p className="text-sm font-bold text-[#14173F] dark:text-white mb-4">Value: R1,000 - R250,000</p>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Eligibility: Youth aged 18-35, valid business plan.</p>
          </div>
        </div>
      )}

      {/* Interview Modal (Simplified) */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-[#14173F]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePlan} className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">New {activeTab === "start" ? "Launch" : "Expansion"} Plan</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Tell Themba about your goal. She'll build a roadmap for you.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">What is your goal?</label>
                <input required value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="e.g. Open a grocery shop" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Location</label>
                <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="e.g. Makhanda, Eastern Cape" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Available Capital (R)</label>
                <input type="number" value={form.capital} onChange={e => setForm({...form, capital: e.target.value})} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white outline-none focus:border-[#5B5BE0]" placeholder="e.g. 15000" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50">
                {busy ? "Creating..." : "Generate Plan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}