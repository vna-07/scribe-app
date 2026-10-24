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
  const [thembaOpen, setThembaOpen] = useState(true);

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
    <div className="flex h-screen overflow-hidden bg-[#F5F1E8] text-[#20221F]">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-[240px] border-r border-[#20221F]/10 flex flex-col bg-[#F5F1E8] shrink-0">
        <div className="p-6 border-b border-[#20221F]/10">
          <p className="font-serif text-xl mb-1">SCRIBE</p>
          <p className="text-[10px] uppercase tracking-widest text-[#20221F]/50">Financial intelligence</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <p className="text-xs font-semibold text-[#20221F]/40 uppercase tracking-wider mb-3 px-2">Your Business</p>
          <a href="#" className="block px-2 py-2 bg-[#20221F]/5 rounded-md font-medium">Overview</a>
          <a href="#" className="block px-2 py-2 text-[#20221F]/60 hover:text-[#20221F] transition-colors">Transactions</a>
          <a href="#" className="block px-2 py-2 text-[#20221F]/60 hover:text-[#20221F] transition-colors">Records & Evidence</a>
          <a href="#" className="block px-2 py-2 text-[#20221F]/60 hover:text-[#20221F] transition-colors">Stock</a>
          <a href="#" className="block px-2 py-2 text-[#20221F]/60 hover:text-[#20221F] transition-colors">Insights & Forecasts</a>
          <a href="#" className="block px-2 py-2 text-[#20221F]/60 hover:text-[#20221F] transition-colors">Business Readiness</a>
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-[#20221F]/40 uppercase tracking-wider mb-3 px-2">Support</p>
          </div>
          <button onClick={() => setThembaOpen(!thembaOpen)} className="block w-full text-left px-2 py-2 text-[#B89A61] font-medium hover:bg-[#B89A61]/10 rounded-md transition-colors">
            Themba {thembaOpen ? "←" : "→"}
          </button>
          <a href="#" className="block px-2 py-2 text-[#20221F]/60 hover:text-[#20221F] transition-colors">Settings & Trust</a>
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-[#20221F]/10 flex items-center justify-between px-8 bg-[#FFFFFF] shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-lg">{data.businessName}</h1>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${
              data.chain.ok ? "border-[#47745D] text-[#47745D] bg-[#47745D]/10" : "border-[#A94E40] text-[#A94E40] bg-[#A94E40]/10"
            }`}>
              {data.chain.ok ? "✓ Chain intact" : `✗ Broken at #${data.chain.brokenAtSeq}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <a href={`/verify/${data.businessId}`} className="text-sm text-[#B89A61] hover:underline font-medium">Public verify →</a>
             <div className="w-8 h-8 rounded-full bg-[#20221F] text-[#F5F1E8] flex items-center justify-center text-xs font-bold">ND</div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl space-y-8">
            
            {/* Greeting */}
            <div>
              <p className="text-sm text-[#20221F]/50 mb-1">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <h2 className="font-serif text-3xl">Here is where your business stands.</h2>
            </div>

            {/* Metrics Row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#FFFFFF] border border-[#20221F]/10 rounded-xl p-5 shadow-sm cursor-pointer hover:border-[#B89A61]/50 transition-colors">
                <p className="text-xs text-[#20221F]/50 mb-1 font-medium">Recorded sales this month</p>
                <p className="font-serif text-3xl mb-1">{rands(data.revenue.low_cents)}</p>
                <p className="text-xs text-[#20221F]/40">Range up to {rands(data.revenue.high_cents)}</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#20221F]/10 rounded-xl p-5 shadow-sm cursor-pointer hover:border-[#B89A61]/50 transition-colors">
                <p className="text-xs text-[#20221F]/50 mb-1 font-medium">Documented readiness</p>
                <p className="font-serif text-3xl mb-1">{data.score.low}–{data.score.high}</p>
                <p className="text-xs text-[#20221F]/40">Not a credit score</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#A94E40]/30 rounded-xl p-5 shadow-sm cursor-pointer hover:border-[#A94E40] transition-colors">
                <p className="text-xs text-[#A94E40] mb-1 font-medium">Stock discrepancy</p>
                <p className="font-serif text-3xl mb-1 text-[#A94E40]">{data.stock.variance} units</p>
                <p className="text-xs text-[#A94E40]/70">Needs your attention</p>
              </div>
            </div>
            {/* Readiness Breakdown */}
            <div className="bg-[#FFFFFF] border border-[#20221F]/10 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="font-serif text-lg">Documented Readiness</h3>
                  <p className="text-xs text-[#20221F]/50">Why the score is what it is.</p>
                </div>
                <span className="font-serif text-2xl">{data.score.low}–{data.score.high}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {data.score.components.map(c => (
                  <div key={c.key}>
                    <div className="flex justify-between text-[10px] font-semibold text-[#20221F]/60 uppercase tracking-wider mb-1">
                      <span>{c.label.split(" ")[0]}</span>
                      <span>{Math.round(c.value * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#F5F1E8] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${c.value > 0.6 ? 'bg-[#47745D]' : c.value > 0.3 ? 'bg-[#B89A61]' : 'bg-[#A94E40]'}`} 
                        style={{ width: `${Math.max(5, c.value * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Next Action */}
            {data.score.counterfactuals.length > 0 && (
              <div className="bg-[#B89A61]/10 border border-[#B89A61]/30 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-[#B89A61] tracking-wider mb-1 uppercase">Next best action</p>
                  <p className="text-sm">{data.score.counterfactuals[0].action}</p>
                </div>
                <button className="bg-[#20221F] text-[#F5F1E8] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3a3d38] transition-colors">Start</button>
              </div>
            )}

            {/* Judge Mode (Demo only) */}
            <div className="border border-[#20221F]/10 rounded-xl p-5 bg-[#FFFFFF]">
              <p className="text-xs font-semibold tracking-wider text-[#20221F]/40 uppercase mb-3">Demo Controls (Judge Mode)</p>
              <div className="flex gap-3">
                <button onClick={() => judgeAction("inject-discrepancy", "inject")} disabled={!!busy} className="border border-[#20221F]/20 px-3 py-2 rounded-md text-sm hover:bg-[#20221F]/5 transition-colors disabled:opacity-50">
                  {busy === "inject" ? "Injecting…" : "Inject Discrepancy"}
                </button>
                <button onClick={() => judgeAction("tamper", "tamper")} disabled={!!busy} className="border border-[#20221F]/20 px-3 py-2 rounded-md text-sm hover:bg-[#20221F]/5 transition-colors disabled:opacity-50">
                  {busy === "tamper" ? "Tampering…" : "Try to Cheat"}
                </button>
                <button onClick={() => judgeAction("reset", "reset")} disabled={!!busy} className="border border-[#20221F]/20 px-3 py-2 rounded-md text-sm hover:bg-[#20221F]/5 transition-colors disabled:opacity-50">
                  {busy === "reset" ? "Resetting…" : "Reset Demo"}
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div>
              <h3 className="font-serif text-xl mb-4">Recent records</h3>
              <div className="bg-[#FFFFFF] border border-[#20221F]/10 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F1E8] border-b border-[#20221F]/10 text-[#20221F]/50 text-xs">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                      <th className="text-center p-3 font-medium">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRecords.map((r) => (
                      <tr key={r.seq} className="border-t border-[#20221F]/5 hover:bg-[#F5F1E8]/50 transition-colors group cursor-pointer">
                        <td className="p-3 text-[#B89A61] font-medium">#{r.seq}</td>
                        <td className="p-3 text-[#20221F]/60">{fmtDate(r.occurred_at)}</td>
                        <td className="p-3">
                          {r.description}
                          {r.quantity != null && <span className="text-[#20221F]/40"> · {r.quantity}u</span>}
                        </td>
                        <td className="p-3 text-right font-medium">{r.amount_cents > 0 ? rands(r.amount_cents) : "—"}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${
                            r.evidence_tier === "counter_signed" ? "text-[#47745D] bg-[#47745D]/10" :
                            r.evidence_tier === "document_supported" ? "text-[#B89A61] bg-[#B89A61]/10" :
                            "text-[#20221F]/40 bg-[#20221F]/5"
                          }`}>
                            {r.evidence_tier.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── THEMBA RIGHT PANEL ─── */}
      {thembaOpen && (
        <aside className="w-[400px] border-l border-[#20221F]/10 bg-[#FFFFFF] flex flex-col shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="p-6 border-b border-[#20221F]/10 bg-[#F5F1E8]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-lg">Themba</h2>
              <span className="text-xs font-medium text-[#B89A61] bg-[#B89A61]/10 px-2 py-1 rounded">AI Assistant</span>
            </div>
            <p className="text-xs text-[#20221F]/50">Your business intelligence assistant</p>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {history.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-[#20221F]/60">Ask Themba to explain your records, investigate discrepancies, or explore what to do next.</p>
                {["Why is my stock short?", "What is my revenue range?", "Will I get a loan?"].map(q => (
                  <button key={q} onClick={() => ask(q)} className="w-full text-left text-sm p-3 rounded-lg border border-[#20221F]/10 hover:border-[#B89A61] hover:bg-[#F5F1E8] transition-all text-[#20221F]/80">
                    "{q}"
                  </button>
                ))}
              </div>
            )}

            {history.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
                {m.role === "user" ? (
                  <div className="inline-block bg-[#F5F1E8] border border-[#20221F]/10 rounded-2xl rounded-tr-sm px-4 py-2 text-left max-w-[85%]">
                    {m.text}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B89A61]/20 flex shrink-0 items-center justify-center text-[10px] font-bold text-[#B89A61]">T</div>
                    <div className="space-y-2">
                      <div className="text-[#20221F]/80 leading-relaxed text-sm">
                        {m.text}
                      </div>
                      {m.refused && (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-[#A94E40] bg-[#A94E40]/10 px-2 py-0.5 rounded">Declined</span>
                      )}
                      {m.sources && m.sources.length > 0 && (
                        <button className="text-xs text-[#B89A61] font-medium hover:underline flex items-center gap-1">
                          Inspect {m.sources.length} supporting records →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {asking && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#B89A61]/20 flex shrink-0 items-center justify-center text-[10px] font-bold text-[#B89A61]">T</div>
                <div className="text-[#20221F]/40 text-sm italic animate-pulse">Analyzing records...</div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#20221F]/10 bg-[#F5F1E8]">
            <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your business…"
                disabled={asking}
                className="w-full bg-[#FFFFFF] border border-[#20221F]/20 focus:border-[#B89A61] outline-none rounded-lg pl-4 pr-12 py-3 text-sm transition-colors"
              />
              <button
                type="submit"
                disabled={asking || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#20221F] text-[#F5F1E8] rounded-md hover:bg-[#3a3d38] disabled:opacity-50 transition-colors"
              >
                ↑
              </button>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}