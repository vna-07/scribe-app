"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";

type CaseStatus = "open" | "investigating" | "requires_attention" | "resolved";

interface Case {
  id: string;
  title: string;
  status: CaseStatus | string;
  findings: string | null;
  created_at: number;
}

const STATUS_STYLES: Record<string, { pill: string; big: string }> = {
  resolved:           { pill: "bg-[#47745D]/10 text-[#47745D]",                 big: "bg-[#47745D] text-white" },
  requires_attention: { pill: "bg-[#B3261E]/10 text-[#B3261E]",                 big: "bg-[#B3261E] text-white" },
  investigating:      { pill: "bg-[#FFF0C4] dark:bg-[#4A3B10] text-[#D99A00]", big: "bg-[#D99A00] text-white" },
  open:               { pill: "bg-[#E1E4F7] dark:bg-[#2A3070] text-[#5A5F8C]", big: "bg-[#E1E4F7] text-[#5A5F8C]" },
};

function style(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.open;
}

function label(status: string) {
  return status.replace(/_/g, " ");
}

export default function CasesTab({ businessId }: { businessId: string }) {
  const { setThembaOpen } = useApp();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [resolving, setResolving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // ── Safety #1: don't hit the API with an empty business_id. ──
    // Shows the empty state immediately instead of a 400/401 error banner.
    if (!businessId) {
      setCases([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const r = await fetch(`/api/cases?business_id=${encodeURIComponent(businessId)}`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`Failed to load cases (${r.status})`);

      const data = await r.json();

      // ── Safety #2: only setCases if the payload is actually an array. ──
      // Guards against the API returning 200 {error: "..."} — which would
      // otherwise get stored as state and crash .map() on the next render.
      if (!Array.isArray(data)) {
        console.error("Cases API returned non-array payload:", data);
        setCases([]);
        setError("Cases API returned an unexpected payload.");
      } else {
        setCases(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // ── Safety #1 continued: skip the fetch entirely when businessId is missing. ──
  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, businessId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function markResolved(c: Case) {
    setResolving(true);
    try {
      const r = await fetch(`/api/cases/${c.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!r.ok) throw new Error("Could not mark resolved");
      showToast("Case marked resolved");
      setSelectedCase(null);
      await refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed");
    } finally {
      setResolving(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-white/50 dark:bg-[#1A1F52] rounded-xl" />;
  }

  if (error) {
    return (
      <div className="bg-[#A94E40]/10 border border-[#A94E40] text-[#A94E40] rounded-xl p-4 text-sm font-bold">
        {error} —{" "}
        <button onClick={refresh} className="underline">retry</button>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 relative">
      {toast && (
        <div role="status" aria-live="polite" className="absolute top-2 right-2 z-20 px-4 py-2 rounded-lg bg-[#14173F] text-white text-xs font-bold shadow-xl">
          {toast}
        </div>
      )}

      {/* List */}
      <div className={`space-y-4 overflow-y-auto pr-2 ${selectedCase ? "w-1/3 hidden md:block" : "w-full"}`}>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Investigations</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Open cases, findings, and missing evidence.</p>
        </div>

        {cases.length === 0 && (
          <div className="bg-white dark:bg-[#1A1F52] rounded-xl border border-dashed border-[#E1E4F7] dark:border-[#2A3070] p-8 text-center">
            <p className="text-sm font-bold text-[#14173F] dark:text-white mb-1">No cases yet</p>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
              Send a receipt or document via Telegram or the web app to start one.
            </p>
          </div>
        )}

        {cases.map(c => (
          <div
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className={`bg-white dark:bg-[#1A1F52] rounded-xl border p-4 shadow-sm hover:border-[#5B5BE0] transition-all cursor-pointer ${
              selectedCase?.id === c.id
                ? "border-[#5B5BE0] ring-1 ring-[#5B5BE0]"
                : "border-[#E1E4F7] dark:border-[#2A3070]"
            }`}
          >
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="font-bold text-[#14173F] dark:text-white text-sm">{c.title}</h3>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${style(c.status).pill}`}>
                {label(c.status)}
              </span>
            </div>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
              Opened: {new Date(c.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Detail */}
      {selectedCase && (
        <div className="flex-1 bg-white dark:bg-[#1A1F52] rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 shadow-sm overflow-y-auto animate-in slide-in-from-right-4">
          <button
            onClick={() => setSelectedCase(null)}
            className="text-xs font-bold text-[#5B5BE0] mb-4 md:hidden"
          >
            ← Back to list
          </button>

          <div className="flex justify-between items-start mb-6 gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-1">{selectedCase.title}</h2>
              <p className="text-sm text-[#5A5F8C] dark:text-[#C5C9F5]">
                Case ID: {selectedCase.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap ${style(selectedCase.status).big}`}>
              {label(selectedCase.status)}
            </span>
          </div>

          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] p-5 rounded-xl mb-6">
            <h3 className="text-sm font-bold text-[#14173F] dark:text-white mb-2">Themba&apos;s Analysis</h3>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
              {selectedCase.findings || "No findings recorded yet. Awaiting more evidence."}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#14173F] dark:text-white">Evidence Timeline</h3>
            <div className="border-l-2 border-[#E1E4F7] dark:border-[#2A3070] pl-4 space-y-6">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#5B5BE0]"></div>
                <p className="text-xs font-bold text-[#14173F] dark:text-white">Case Opened</p>
                <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
                  {new Date(selectedCase.created_at).toLocaleString()}
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#D99A00]"></div>
                <p className="text-xs font-bold text-[#14173F] dark:text-white">Document Extracted</p>
                <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
                  SCRIBE extracted the data and flagged the anomaly.
                </p>
              </div>
              {selectedCase.status === "resolved" ? (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#47745D]"></div>
                  <p className="text-xs font-bold text-[#14173F] dark:text-white">Resolved</p>
                  <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
                    Case closed. No further action required.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-[#E1E4F7] bg-white"></div>
                  <p className="text-xs font-bold text-[#14173F] dark:text-white">Pending Review</p>
                  <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
                    Awaiting trader confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E1E4F7] dark:border-[#2A3070] flex flex-wrap gap-3">
            <button
              onClick={() => setThembaOpen(true)}
              className="bg-[#5B5BE0] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#4B4FC9]"
            >
              Ask Themba about this
            </button>
            {selectedCase.status !== "resolved" && (
              <button
                onClick={() => markResolved(selectedCase)}
                disabled={resolving}
                className="bg-white dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#2A3070] text-[#14173F] dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                {resolving ? "Resolving…" : "Mark Resolved"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}