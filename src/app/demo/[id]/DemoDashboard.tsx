"use client";

import { useState } from "react";
import type { DemoData } from "@/lib/demo-data";
import { rands, fmtDate } from "@/lib/format";

interface ThembaMsg {
  role: "user" | "themba";
  text: string;
  refused?: boolean;
  provider?: string;
  sources?: string[];
}

export default function DemoDashboard({ initialData }: { initialData: DemoData }) {
  const [data, setData] = useState<DemoData>(initialData);
  const [busy, setBusy] = useState<string | null>(null);
  const [history, setHistory] = useState<ThembaMsg[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);

  const refresh = async () => {
    const r = await fetch(`/api/demo/${data.businessId}`);
    if (r.ok) setData(await r.json());
  };

  const judgeAction = async (path: string, label: string) => {
    setBusy(label);
    try {
      await fetch(`/api/judge/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business_id: data.businessId }),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const ask = async (q: string) => {
    if (!q.trim() || asking) return;
    setAsking(true);
    setHistory((h) => [...h, { role: "user", text: q }]);
    setInput("");
    try {
      const r = await fetch("/api/themba", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business_id: data.businessId, question: q }),
      });
      const json = await r.json();
      setHistory((h) => [
        ...h,
        {
          role: "themba",
          text: json.answer ?? "(no answer)",
          refused: json.refused,
          provider: json.provider,
          sources: json.sources,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-[#f5f0e6]">
      <header className="border-b border-[#333] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[#c9a961] tracking-[0.2em] text-xs">SCRIBE DEMO</p>
          <h1 className="font-serif text-xl">{data.businessName}</h1>
          <p className="text-[#a8a093] text-xs">{data.businessLocation}</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              data.chain.ok
                ? "border-green-700 bg-green-950 text-green-300"
                : "border-red-700 bg-red-950 text-red-300"
            }`}
          >
            {data.chain.ok ? "✓ Chain intact" : `✗ Chain broken at #${data.chain.brokenAtSeq}`}
          </div>
          <a
            href={`/verify/${data.businessId}`}
            className="text-xs text-[#c9a961] hover:underline"
          >
            Public view →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <Card
            title="Stock reconciliation"
            big={data.stock.variance === null ? "No count" : `${data.stock.variance}`}
            accent={data.stock.variance !== 0 && data.stock.variance !== null}
            detail={
              data.stock.counted === null
                ? "Record a physical count to enable variance."
                : `Expected ${data.stock.expected} · counted ${data.stock.counted}`
            }
          />
          <Card
            title="Documented readiness"
            big={`${data.score.low}–${data.score.high}`}
            accent={false}
            detail="Range, not a credit score. Every component explains itself."
          />
          <Card
            title="Records sealed"
            big={`${data.recordCount}`}
            accent={false}
            detail={`${data.chain.total} verified · ${data.stock.variance === null ? "no count" : "counted"}`}
          />
        </div>

        {data.score.counterfactuals.length > 0 && (
          <div className="border border-[#c9a961] bg-[#221e10] rounded-xl p-4">
            <p className="text-xs text-[#c9a961] tracking-[0.15em] mb-1">NEXT BEST ACTION</p>
            <p className="text-sm">{data.score.counterfactuals[0].action}</p>
            <p className="text-xs text-[#a8a093] mt-1">
              {data.score.counterfactuals[0].rationale}
            </p>
          </div>
        )}

        <section>
          <p className="text-xs text-[#c9a961] tracking-[0.2em] mb-2">JUDGE MODE</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => judgeAction("inject-discrepancy", "inject")}
              disabled={!!busy}
              className="border border-[#c9a961] bg-transparent hover:bg-[#221e10] px-4 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {busy === "inject" ? "Injecting…" : "Inject a discrepancy"}
            </button>
            <button
              onClick={() => judgeAction("tamper", "tamper")}
              disabled={!!busy}
              className="border border-[#c9a961] bg-transparent hover:bg-[#221e10] px-4 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {busy === "tamper" ? "Tampering…" : "Try to cheat"}
            </button>
            <button
              onClick={() => judgeAction("reset", "reset")}
              disabled={!!busy}
              className="border border-[#555] px-4 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {busy === "reset" ? "Resetting…" : "Reset demo"}
            </button>
          </div>
          <p className="text-xs text-[#a8a093] mt-2">
            Inject adds a sealed loss record. Tamper edits a signed record in the database
            without re-signing — verification must fail.
          </p>
        </section>

        <section>
          <p className="text-xs text-[#c9a961] tracking-[0.2em] mb-2">RECENT RECORDS</p>
          <div className="border border-[#333] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#222] text-[#a8a093] text-xs">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-left p-3">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRecords.map((r) => (
                  <tr key={r.seq} className="border-t border-[#333]">
                    <td className="p-3 text-[#c9a961]">#{r.seq}</td>
                    <td className="p-3 text-[#a8a093]">{fmtDate(r.occurred_at)}</td>
                    <td className="p-3">
                      {r.description}
                      {r.quantity != null && (
                        <span className="text-[#a8a093]"> · {r.quantity}u</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {r.amount_cents > 0 ? rands(r.amount_cents) : "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          r.evidence_tier === "counter_signed"
                            ? "bg-green-950 text-green-300"
                            : r.evidence_tier === "document_supported"
                            ? "bg-yellow-950 text-yellow-300"
                            : "bg-[#333] text-[#a8a093]"
                        }`}
                      >
                        {r.evidence_tier.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <p className="text-xs text-[#c9a961] tracking-[0.2em] mb-2">THEMBA · ASSISTANT</p>
          <div className="border border-[#333] rounded-xl p-4 space-y-3 min-h-[160px]">
            {history.length === 0 && (
              <div className="text-[#a8a093] text-sm">
                <p className="mb-2">Ask Themba about this business. Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Why is my stock short?",
                    "What is my revenue?",
                    "What is my readiness score?",
                    "Will I get a loan?",
                    "What should I record next?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="text-xs border border-[#333] hover:border-[#c9a961] rounded px-2 py-1"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className="text-sm">
                {m.role === "user" ? (
                  <p className="text-[#c9a961]">
                    <span className="text-[#a8a093] text-xs mr-2">YOU</span>
                    {m.text}
                  </p>
                ) : (
                  <div className="border-l-2 border-[#c9a961] pl-3">
                    <p className="text-[#a8a093] text-xs mb-1">
                      THEMBA
                      {m.refused && (
                        <span className="ml-2 text-yellow-300">· declined</span>
                      )}
                      {m.provider === "fallback" && (
                        <span className="ml-2 text-[#666]">· deterministic</span>
                      )}
                    </p>
                    <p>{m.text}</p>
                    {m.sources && m.sources.length > 0 && (
                      <p className="text-[#666] text-xs mt-1">
                        Cited {m.sources.length} record{m.sources.length === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {asking && <p className="text-xs text-[#a8a093]">Themba is thinking…</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mt-2 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Themba about the records…"
              disabled={asking}
              className="flex-1 bg-[#222] border border-[#333] focus:border-[#c9a961] outline-none rounded-lg px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={asking || !input.trim()}
              className="bg-[#c9a961] text-[#1a1a1a] font-medium px-5 rounded-lg disabled:opacity-40"
            >
              Ask
            </button>
          </form>
        </section>

        <p className="text-xs text-[#666] pt-6">
          Composite demo business. No real trader data. Every figure on this page is computed
          from sealed records — nothing is hardcoded.
        </p>
      </div>
    </main>
  );
}

function Card({
  title,
  big,
  detail,
  accent,
}: {
  title: string;
  big: string;
  detail: string;
  accent: boolean;
}) {
  return (
    <div className="border border-[#333] rounded-xl p-4">
      <p className="text-[#a8a093] text-xs mb-1">{title}</p>
      <p
        className={`font-serif text-3xl ${
          accent ? "text-[#c9a961]" : "text-[#f5f0e6]"
        }`}
      >
        {big}
      </p>
      <p className="text-[#666] text-xs mt-1">{detail}</p>
    </div>
  );
}