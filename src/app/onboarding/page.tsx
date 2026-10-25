"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("Spaza shop");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, business_type: businessType, location, currency: "ZAR",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create business");
      router.push(`/demo/${json.id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#E9EBFF] dark:bg-[#0E1130]">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 shadow-xl border border-[#E1E4F7] dark:border-[#2A3070]">
        <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-widest mb-2">Step 1 of 1</p>
        <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">Tell us about your business</h1>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">
          This shapes how SCRIBE organises and reconciles your records. No invented numbers on day one.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Business name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none transition-colors"
              placeholder="Nomsa's Spaza" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Business type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
              className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none transition-colors">
              <option>Spaza shop</option>
              <option>Street vendor</option>
              <option>Salon</option>
              <option>Repair service</option>
              <option>Food &amp; beverage</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Location</label>
            <input required value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none transition-colors"
              placeholder="Makhanda, Eastern Cape" />
          </div>
          {err && <p className="text-sm text-[#B3261E] dark:text-[#FF8A80] font-semibold">{err}</p>}
          <button type="submit" disabled={busy}
            className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors disabled:opacity-50 shadow-md">
            {busy ? "Creating…" : "Create business"}
          </button>
        </form>
      </div>
    </main>
  );
}