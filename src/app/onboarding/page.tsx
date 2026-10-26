"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Path = "business" | "side_hustle" | "planning";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [path, setPath] = useState<Path | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    business_type: "Spaza shop",
    description: "",
    location: "",
    business_stage: "existing",
    registration_status: "unknown",
    vat_status: "unknown",
    currency: "ZAR",
    main_goal: "",
    start_fresh: true,
  });

  const choosePath = (p: Path) => {
    setPath(p);
    // Adapt the default business_stage based on the path
    const stageMap: Record<Path, string> = {
      business: "existing",
      side_hustle: "growing",
      planning: "starting",
    };
    setForm(f => ({ ...f, business_stage: stageMap[p] }));
    setStep(2);
  };

  const nextFromBasics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      setErr("Business name and location are required.");
      return;
    }
    setErr(null);
    setStep(3);
  };

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          business_type: form.business_type,
          location: form.location,
          currency: form.currency,
          description: form.description,
          onboarding_path: path,
          business_stage: form.business_stage,
          registration_status: form.registration_status,
          vat_status: form.vat_status,
          main_goal: form.main_goal,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create business");
      router.push(`/demo/${json.id}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E9EBFF] dark:bg-[#0E1130] p-6">
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-[#5B5BE0]" : "bg-[#E1E4F7] dark:bg-[#2A3070]"
              }`}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 shadow-xl border border-[#E1E4F7] dark:border-[#2A3070]">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/logo_symbol.png" alt="SCRIBE" width={32} height={32} style={{ width: "auto", height: "auto" }} className="rounded-lg" />
            <span className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-widest">
              Step {step} of 4
            </span>
          </div>

          {/* ─── STEP 1: Path selection ─── */}
          {step === 1 && (
            <>
              <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">
                Let&apos;s get to know your situation.
              </h1>
              <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">
                This shapes your workspace, features, and how Themba helps you.
              </p>

              <div className="space-y-3">
                <PathCard
                  icon="🏪"
                  title="I run a business"
                  body="A shop, service, farm, company or other venture already generating revenue."
                  onClick={() => choosePath("business")}
                />
                <PathCard
                  icon="⚡"
                  title="I have a side hustle"
                  body="Freelancing, reselling, creative work, or a small income-generating activity."
                  onClick={() => choosePath("side_hustle")}
                />
                <PathCard
                  icon="🌱"
                  title="I'm planning a business"
                  body="An idea I want to develop into a practical venture. I need a starting point."
                  onClick={() => choosePath("planning")}
                />
              </div>
            </>
          )}

          {/* ─── STEP 2: Business basics ─── */}
          {step === 2 && (
            <form onSubmit={nextFromBasics}>
              <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">
                {path === "planning" ? "What are you planning?" : "Tell us about the business."}
              </h1>
              <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">
                {path === "planning"
                  ? "You can change any of this later as the plan evolves."
                  : "You can update these details anytime in Settings."}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">
                    {path === "planning" ? "Project name" : "Business name"} *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                    placeholder={path === "planning" ? "e.g. Makhanda Grocery Co-op" : "e.g. Nomsa's Spaza"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">
                      {path === "planning" ? "Category" : "Business type"}
                    </label>
                    <select
                      value={form.business_type}
                      onChange={e => setForm({ ...form, business_type: e.target.value })}
                      className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                    >
                      <option>Spaza shop</option>
                      <option>Street vendor</option>
                      <option>Salon</option>
                      <option>Repair service</option>
                      <option>Food &amp; beverage</option>
                      <option>Consulting</option>
                      <option>Freelance / creative</option>
                      <option>Agriculture</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Location *</label>
                    <input
                      required
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                      placeholder="Makhanda, EC"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">
                    Brief description (optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none resize-none"
                    placeholder="What does your business do?"
                  />
                </div>
              </div>

              {err && <p className="text-sm text-[#B3261E] dark:text-[#FF8A80] font-semibold mt-4">{err}</p>}

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
                  Back
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 3: Status & compliance ─── */}
          {step === 3 && (
            <>
              <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">
                A few more details.
              </h1>
              <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">
                Only what helps us tailor your workspace. Nothing here is assumed — you can skip.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Business stage</label>
                  <select
                    value={form.business_stage}
                    onChange={e => setForm({ ...form, business_stage: e.target.value })}
                    className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                  >
                    <option value="existing">Operating — already trading</option>
                    <option value="starting">Starting — first sales ahead</option>
                    <option value="growing">Growing — scaling up</option>
                    <option value="restarting">Restarting — recovering</option>
                    <option value="planning">Still planning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Registration status</label>
                  <select
                    value={form.registration_status}
                    onChange={e => setForm({ ...form, registration_status: e.target.value })}
                    className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                  >
                    <option value="unknown">Not sure / prefer not to say</option>
                    <option value="registered">Formally registered (CIPC)</option>
                    <option value="not_registered">Not registered yet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">VAT status</label>
                  <select
                    value={form.vat_status}
                    onChange={e => setForm({ ...form, vat_status: e.target.value })}
                    className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                  >
                    <option value="unknown">Not sure / prefer not to say</option>
                    <option value="registered">VAT registered</option>
                    <option value="not_registered">Below VAT threshold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Main goal right now</label>
                  <input
                    value={form.main_goal}
                    onChange={e => setForm({ ...form, main_goal: e.target.value })}
                    className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
                    placeholder="e.g. Understand my real profit, or: prepare for funding"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="px-6 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#AEFF] font-bold rounded-xl">
                  Back
                </button>
                <button onClick={() => setStep(4)} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md">
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 4: Starting point ─── */}
          {step === 4 && (
            <>
              <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">
                Where do you want to start?
              </h1>
              <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">
                You can always do the other one later. Nothing is locked in.
              </p>

              <div className="space-y-3 mb-8">
                <PathCard
                  icon="📄"
                  title="Start fresh"
                  body="I'll add records as they happen. SCRIBE will guide me through my first sale, expense, and product."
                  onClick={() => setForm({ ...form, start_fresh: true })}
                  selected={form.start_fresh}
                />
                <PathCard
                  icon="📥"
                  title="Import existing records"
                  body="I have a CSV export from a spreadsheet, POS system, or bank statement I want to bring in."
                  onClick={() => setForm({ ...form, start_fresh: false })}
                  selected={!form.start_fresh}
                />
              </div>

              {err && <p className="text-sm text-[#B3261E] dark:text-[#FF8A80] font-semibold mb-4">{err}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-6 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
                  Back
                </button>
                <button
                  onClick={submit}
                  disabled={busy}
                  className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors disabled:opacity-50 shadow-md"
                >
                  {busy ? "Creating workspace…" : "Create workspace"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] text-center mt-6">
          By continuing, you agree to our{" "}
          <Link href="/privacy" className="text-[#5B5BE0] font-bold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

function PathCard({
  icon,
  title,
  body,
  onClick,
  selected,
}: {
  icon: string;
  title: string;
  body: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
        selected
          ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]"
          : "border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#A9AEFF] dark:hover:border-[#5B5BE0]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl shrink-0">{icon}</span>
        <div>
          <p className="font-extrabold text-[#14173F] dark:text-white mb-1">{title}</p>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">{body}</p>
        </div>
        {selected && (
          <span className="ml-auto shrink-0 w-5 h-5 rounded-full bg-[#5B5BE0] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}