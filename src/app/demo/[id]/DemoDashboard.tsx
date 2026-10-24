"use client";

import { useState } from "react";
import type { DemoData } from "@/lib/demo-data";
import { rands, fmtDate } from "@/lib/format";
import Image from "next/image";

interface ThembaMsg {
  role: "user" | "themba";
  text: string;
  refused?: boolean;
  provider?: string;
  sources?: string[];
}

type ThembaTab = "ask" | "insights" | "actions";
type MainTab = "overview" | "records";

export default function DemoDashboard({ initialData }: { initialData: DemoData }) {
  const [data, setData] = useState<DemoData>(initialData);
  const [busy, setBusy] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("overview");
  
  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Themba State
  const [thembaTab, setThembaTab] = useState<ThembaTab>("ask");
  const [history, setHistory] = useState<ThembaMsg[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);

  // Modals
  const [showExport, setShowExport] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [newRecord, setNewRecord] = useState({ description: "", amount: "", kind: "sale", quantity: "" });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = async () => {
    const r = await fetch(`/api/demo/${data.businessId}`);
    if (r.ok) setData(await r.json());
  };

  const judgeAction = async (path: string, label: string) => {
    setBusy(label);
    try {
      const res = await fetch(`/api/judge/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business_id: data.businessId }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
      
      if (path === "tamper") showToast("Record tampered. The hash chain is now broken.", "error");
      else if (path === "inject") showToast("Discrepancy injected. Variance updated.", "success");
      else showToast("Demo reset. Chain intact.", "success");
      
    } catch {
      showToast("Action failed.", "error");
    } finally {
      setBusy(null);
    }
  };

  const submitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("capture");
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_id: data.businessId,
          kind: newRecord.kind,
          amount_cents: Math.round(parseFloat(newRecord.amount || "0") * 100),
          description: newRecord.description,
          quantity: newRecord.quantity ? parseInt(newRecord.quantity) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
      setShowCapture(false);
      setNewRecord({ description: "", amount: "", kind: "sale", quantity: "" });
      showToast("Record sealed into the ledger.", "success");
    } catch {
      showToast("Failed to save record.", "error");
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
        { role: "themba", text: json.answer ?? "(no answer)", refused: json.refused, provider: json.provider, sources: json.sources },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const weakestComponent = [...data.score.components].sort((a,b) => a.value - b.value)[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#E9EBFF] text-[#14173F] font-sans relative">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 ${toast.type === "success" ? "bg-[#14173F] text-white" : "bg-[#A94E40] text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className="w-[260px] m-4 mr-0 bg-white rounded-[28px] shadow-sm flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 pb-2 flex items-center gap-3">
          <Image src="/logo_symbol.png" alt="S" width={36} height={36} style={{ width: 'auto', height: 'auto' }} className="rounded-xl shadow-sm" />
          <span className="font-extrabold text-xl tracking-wide text-[#14173F]">SCRIBE</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm font-semibold text-[#5A5F8C]">
          <button onClick={() => setMainTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${mainTab === "overview" ? "bg-[#ECEEFF] text-[#4B4FC9]" : "hover:bg-[#F1F2FF]"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </button>
          <button onClick={() => setMainTab("records")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${mainTab === "records" ? "bg-[#ECEEFF] text-[#4B4FC9]" : "hover:bg-[#F1F2FF]"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Records & Evidence
          </button>
          {/* Other links can be wired up later */}
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#F1F2FF] rounded-2xl transition-colors opacity-50 cursor-not-allowed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Stock
          </a>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-[#8F95FF] to-[#5B5BE0] rounded-[22px] text-white">
          <div className="font-extrabold text-[15px] mb-1">Get lender-ready</div>
          <div className="text-xs text-[#ECEEFF] leading-relaxed mb-3">Add one stock count to lift your score range.</div>
          <button onClick={() => setShowCapture(true)} className="bg-white text-[#4B4FC9] font-bold text-xs px-4 py-2 rounded-xl w-full shadow-sm">
            Count stock
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 m-4 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {mainTab === "overview" ? "Molo, Nomsa" : "Records & Evidence"}
            </h1>
            <p className="text-sm font-semibold text-[#4A4F7A]">{data.businessName} · Week of 19 Oct</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              data.chain.ok ? "bg-white text-[#14173F] shadow-sm" : "bg-[#A94E40] text-white"
            }`}>
              <span className={`w-2 h-2 rounded-full ${data.chain.ok ? "bg-[#5B5BE0]" : "bg-white"}`}></span>
              {data.chain.ok ? `Ledger intact: ${data.chain.total} records` : `Tampered at #${data.chain.brokenAtSeq}`}
            </span>
            <button onClick={() => setShowExport(true)} className="px-5 py-2.5 rounded-xl bg-white text-[#14173F] font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
              Share statement
            </button>
            <button onClick={() => setShowCapture(true)} className="px-5 py-2.5 rounded-xl bg-[#14173F] text-white font-bold text-sm shadow-md hover:bg-[#2A3070] transition-colors">
              Capture entry
            </button>
          </div>
        </header>

        {/* ─── OVERVIEW TAB ─── */}
        {mainTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#A9AEFF] rounded-[24px] p-5 shadow-sm">
                <div className="text-xs font-bold text-[#1D2260] mb-1">Sales this week</div>
                <div className="text-2xl font-extrabold tracking-tight">{rands(data.revenue.low_cents)}</div>
                <div className="text-xs font-medium text-[#1D2260] mt-2">Range to {rands(data.revenue.high_cents)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-white/50">
                <div className="text-xs font-bold text-[#4A4F7A] mb-1">Cash on hand</div>
                <div className="text-2xl font-extrabold tracking-tight">R3 245</div>
                <div className="text-xs font-medium text-[#4A4F7A] mt-2">Reported Friday 16:40</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-white/50">
                <div className="text-xs font-bold text-[#4A4F7A] mb-1">Stock gaps to review</div>
                <div className="text-2xl font-extrabold tracking-tight text-[#D99A00]">
                  {data.stock.variance === null ? "0" : "2"} products
                </div>
                <div className="text-xs font-medium text-[#4A4F7A] mt-2">Bread and sugar differ</div>
              </div>
              <div className="bg-[#14173F] rounded-[24px] p-5 shadow-md text-white">
                <div className="text-xs font-bold text-[#C5C9F5] mb-1">Consistency Score</div>
                <div className="text-2xl font-extrabold tracking-tight text-[#A9AEFF]">{data.score.low}–{data.score.high}</div>
                <div className="text-xs font-medium text-[#C5C9F5] mt-2">Evidence of readiness</div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 bg-white/90 rounded-[28px] p-6 shadow-sm border border-white/50">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-lg">Daily takings and outlook</h3>
                    <p className="text-xs font-medium text-[#4A4F7A]">Shaded bars are a forecast with prediction intervals.</p>
                  </div>
                </div>
                <div className="flex items-end justify-between h-40 gap-2">
                  {[40, 60, 45, 80, 90, 65, 85, 55, 75].map((h, i) => (
                    <div key={i} className="w-full bg-[#14173F] rounded-t-md" style={{ height: `${h}%` }}></div>
                  ))}
                  {[95, 70, 60, 50].map((h, i) => (
                    <div key={i} className="w-full bg-[#CDD1FF] border-2 border-dashed border-[#5B5BE0] rounded-t-md flex items-end justify-center pb-2" style={{ height: `${h}%` }}>
                      <div className="w-full border-t-2 border-[#5B5BE0] absolute top-0"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-white/90 rounded-[28px] p-6 shadow-sm border border-white/50">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-extrabold text-lg">Trading Consistency Score</h3>
                    <p className="text-xs font-medium text-[#4A4F7A]">Click a component to see how to improve it.</p>
                  </div>
                  <span className="font-extrabold text-2xl text-[#5B5BE0]">{data.score.low}–{data.score.high}</span>
                </div>
                <div className="space-y-4">
                  {data.score.components.map(c => (
                    <div key={c.key} className="cursor-pointer group">
                      <div className="flex justify-between text-xs font-bold mb-1 group-hover:text-[#5B5BE0] transition-colors">
                        <span>{c.label}</span>
                        <span>{Math.round(c.value * 100)}</span>
                      </div>
                      <div className="h-2 w-full bg-[#E6E8FA] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${c.value > 0.6 ? 'bg-[#14173F]' : c.value > 0.3 ? 'bg-[#A9AEFF]' : 'bg-[#D99A00]'}`} style={{ width: `${Math.max(5, c.value * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 bg-[#FFF0C4] rounded-xl p-3 text-xs font-bold leading-relaxed text-[#1D2260]">
                  Weakest component: {weakestComponent.label}. {data.score.counterfactuals[0]?.action || "Keep recording to improve."}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 bg-white/90 rounded-[28px] p-6 shadow-sm border border-white/50">
                <h3 className="font-extrabold text-lg mb-4">Stock-flow reconciliation</h3>
                <div className="bg-[#F1F2FF] rounded-xl p-4 flex justify-between items-center mb-4">
                  <div className="text-sm font-semibold">Expected: {data.stock.expected} units</div>
                  <div className="text-sm font-semibold">Counted: {data.stock.counted ?? "—"}</div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-lg ${data.stock.variance !== 0 ? "bg-[#A9AEFF] text-[#14173F]" : "bg-white"}`}>
                    Variance: {data.stock.variance ?? "—"}
                  </div>
                </div>
                <p className="text-xs text-[#4A4F7A] leading-relaxed mb-4">{data.stock.note}</p>
                
                <div className="border-t border-[#E1E4F7] pt-4">
                  <p className="text-xs font-bold text-[#14173F] mb-2 uppercase tracking-wider">Judge Mode</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => judgeAction("inject-discrepancy", "inject")} disabled={!!busy} className="px-3 py-2 bg-[#F1F2FF] text-[#4B4FC9] hover:bg-[#E6E8FA] rounded-lg text-xs font-bold transition-colors">
                      {busy === "inject" ? "Working..." : "Inject Discrepancy"}
                    </button>
                    <button onClick={() => judgeAction("tamper", "tamper")} disabled={!!busy} className="px-3 py-2 bg-[#F1F2FF] text-[#4B4FC9] hover:bg-[#E6E8FA] rounded-lg text-xs font-bold transition-colors">
                      {busy === "tamper" ? "Working..." : "Try to Cheat"}
                    </button>
                    <button onClick={() => judgeAction("reset", "reset")} disabled={!!busy} className="px-3 py-2 bg-white border border-[#E1E4F7] text-[#4A4F7A] hover:text-[#14173F] rounded-lg text-xs font-bold transition-colors">
                      {busy === "reset" ? "Working..." : "Reset Demo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── RECORDS TAB ─── */}
        {mainTab === "records" && (
          <div className="bg-white/90 rounded-[28px] p-6 shadow-sm border border-white/50 flex-1 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-extrabold">Forensic Ledger</h2>
                <p className="text-sm text-[#4A4F7A]">Every record is cryptographically signed. Any edit will break the chain.</p>
              </div>
              <button onClick={() => setShowCapture(true)} className="px-4 py-2 bg-[#14173F] text-white rounded-lg text-sm font-bold">
                + Add Record
              </button>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F1F2FF] text-[#4A4F7A] text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 rounded-tl-xl">Seq</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Evidence</th>
                  <th className="p-4 rounded-tr-xl">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4F7]">
                {data.recentRecords.map(r => (
                  <tr key={r.seq} className="hover:bg-[#F1F2FF]/50 transition-colors">
                    <td className="p-4 font-bold text-[#5B5BE0]">#{r.seq}</td>
                    <td className="p-4 text-[#4A4F7A]">{fmtDate(r.occurred_at)}</td>
                    <td className="p-4 font-medium">{r.description}</td>
                    <td className="p-4 font-bold">{rands(r.amount_cents)}</td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg ${
                        r.evidence_tier === "counter_signed" ? "bg-[#47745D]/10 text-[#47745D]" : 
                        r.evidence_tier === "document_supported" ? "bg-[#A9AEFF]/20 text-[#4B4FC9]" : "bg-[#E6E8FA] text-[#4A4F7A]"
                      }`}>
                        {r.evidence_tier.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-[#5A5F8C] truncate max-w-[120px]" title="Cryptographic hash">
                      {r.occurred_at.toString(16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ─── THEMBA RIGHT PANEL ─── */}
      <aside className="w-[380px] m-4 ml-0 bg-[#14173F] rounded-[28px] shadow-2xl flex flex-col shrink-0 overflow-hidden text-white">
        <div className="p-6 bg-[#1F2561] border-b border-[#2A3070]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#A9AEFF] text-[#14173F] flex items-center justify-center font-extrabold text-lg">T</div>
            <div>
              <h2 className="font-extrabold text-lg">Themba</h2>
              <p className="text-xs text-[#C5C9F5]">Explains your records. Never calculates.</p>
            </div>
          </div>
          
          <div className="flex bg-[#14173F] p-1 rounded-xl">
            {(["ask", "insights", "actions"] as ThembaTab[]).map(tab => (
              <button key={tab} onClick={() => setThembaTab(tab)} className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-colors ${thembaTab === tab ? "bg-[#2A3070] text-white" : "text-[#C5C9F5] hover:text-white"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {thembaTab === "ask" && (
            <>
              {history.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-[#C5C9F5]">Ask Themba to explain your records, investigate discrepancies, or explore what to do next.</p>
                  {["Why is my bread stock short?", "What is my revenue range?", "Will I get a loan?"].map(q => (
                    <button key={q} onClick={() => ask(q)} className="w-full text-left text-sm p-3 rounded-xl bg-[#1F2561] hover:bg-[#2A3070] transition-colors text-[#E1E3FA] border border-[#2A3070]">
                      "{q}"
                    </button>
                  ))}
                </div>
              )}
              {history.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
                  {m.role === "user" ? (
                    <div className="inline-block bg-[#2A3070] rounded-2xl rounded-tr-sm px-4 py-2 text-left max-w-[85%] text-[#E1E3FA]">{m.text}</div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#A9AEFF] flex shrink-0 items-center justify-center text-[10px] font-extrabold text-[#14173F]">T</div>
                      <div className="space-y-2">
                        <div className="text-[#E1E3FA] leading-relaxed text-sm bg-white text-[#14173F] p-3 rounded-xl rounded-tl-sm">{m.text}</div>
                        {m.refused && <span className="inline-block text-[10px] uppercase tracking-wider text-[#D99A00] bg-[#D99A00]/10 px-2 py-0.5 rounded">Declined</span>}
                        {m.sources && m.sources.length > 0 && (
                          <button onClick={() => { setMainTab("records"); showToast("Opened ledger to inspect sources.", "success"); }} className="text-xs text-[#A9AEFF] font-bold hover:underline flex items-center gap-1">
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
                  <div className="w-6 h-6 rounded-full bg-[#A9AEFF] flex shrink-0 items-center justify-center text-[10px] font-extrabold text-[#14173F]">T</div>
                  <div className="text-[#A9AEFF] text-sm italic animate-pulse">Analyzing records...</div>
                </div>
              )}
            </>
          )}

          {thembaTab === "insights" && (
            <div className="space-y-4">
              <div className="bg-[#1F2561] p-4 rounded-xl border border-[#2A3070]">
                <p className="text-xs text-[#A9AEFF] font-bold uppercase mb-1">Sales Pattern</p>
                <p className="text-sm text-[#E1E3FA] leading-relaxed">Recorded sales are generally higher on Fridays. Consider checking stock levels before the weekend.</p>
              </div>
              <div className="bg-[#1F2561] p-4 rounded-xl border border-[#2A3070]">
                <p className="text-xs text-[#A9AEFF] font-bold uppercase mb-1">Stock Discrepancy</p>
                <p className="text-sm text-[#E1E3FA] leading-relaxed">Bread and sugar have repeated variances. Review delivery slips before the next order.</p>
              </div>
            </div>
          )}

          {thembaTab === "actions" && (
             <div className="space-y-4">
              <div className="bg-[#A9AEFF] text-[#14173F] p-4 rounded-xl">
                <p className="text-xs font-bold uppercase mb-1">Next Best Action</p>
                <p className="text-sm font-extrabold leading-relaxed">Record one physical stock count</p>
                <p className="text-xs mt-1 leading-relaxed">This lifts stock consistency and narrows your revenue range.</p>
                <button onClick={() => setShowCapture(true)} className="mt-3 bg-[#14173F] text-white text-xs font-bold px-4 py-2 rounded-lg w-full">Record Stock Count</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1F2561] border-t border-[#2A3070]">
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your business…"
              disabled={asking}
              className="w-full bg-[#14173F] border border-[#2A3070] focus:border-[#A9AEFF] outline-none rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-[#5A5F8C] transition-colors"
            />
            <button type="submit" disabled={asking || !input.trim()} className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#A9AEFF] text-[#14173F] rounded-lg hover:bg-white disabled:opacity-50 transition-colors font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
            </button>
          </form>
        </div>
      </aside>

      {/* ─── CAPTURE MODAL ─── */}
      {showCapture && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold mb-2 text-[#14173F]">Capture Entry</h2>
            <p className="text-sm text-[#4A4F7A] mb-6">This record will be cryptographically sealed into the ledger.</p>
            
            <form onSubmit={submitRecord} className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] mb-1">Description</label>
                <input required value={newRecord.description} onChange={e => setNewRecord({...newRecord, description: e.target.value})} placeholder="e.g. Bread sales" className="w-full bg-[#F1F2FF] border border-[#E1E4F7] rounded-xl px-4 py-3 text-sm focus:border-[#5B5BE0] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] mb-1">Amount (R)</label>
                  <input required type="number" step="0.01" value={newRecord.amount} onChange={e => setNewRecord({...newRecord, amount: e.target.value})} placeholder="0.00" className="w-full bg-[#F1F2FF] border border-[#E1E4F7] rounded-xl px-4 py-3 text-sm focus:border-[#5B5BE0] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] mb-1">Type</label>
                  <select value={newRecord.kind} onChange={e => setNewRecord({...newRecord, kind: e.target.value})} className="w-full bg-[#F1F2FF] border border-[#E1E4F7] rounded-xl px-4 py-3 text-sm focus:border-[#5B5BE0] outline-none">
                    <option value="sale">Sale</option>
                    <option value="expense">Expense</option>
                    <option value="stock_purchase">Stock Purchase</option>
                    <option value="stock_count">Stock Count</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] mb-1">Quantity (optional)</label>
                <input type="number" value={newRecord.quantity} onChange={e => setNewRecord({...newRecord, quantity: e.target.value})} placeholder="e.g. 10" className="w-full bg-[#F1F2FF] border border-[#E1E4F7] rounded-xl px-4 py-3 text-sm focus:border-[#5B5BE0] outline-none" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCapture(false)} className="flex-1 py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl hover:bg-[#E6E8FA] transition-colors">Cancel</button>
                <button type="submit" disabled={busy === "capture"} className="flex-1 py-3 bg-[#14173F] text-white font-bold rounded-xl hover:bg-[#2A3070] transition-colors shadow-md">
                  {busy === "capture" ? "Sealing..." : "Confirm & Seal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EXPORT CENTRE MODAL ─── */}
      {showExport && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-extrabold mb-2 text-[#14173F]">Export Centre</h2>
            <p className="text-sm text-[#4A4F7A] mb-6">Share verified statements with lenders, accountants, or suppliers.</p>
            
            <div className="space-y-3 mb-8">
              <button onClick={() => { showToast("CSV downloading...", "success"); setShowExport(false); }} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#E1E4F7] hover:border-[#5B5BE0] transition-colors text-left group">
                <div>
                  <div className="font-bold text-[#14173F]">Download CSV Data</div>
                  <div className="text-xs text-[#4A4F7A]">All sealed transactions and evidence tiers.</div>
                </div>
                <span className="text-[#5B5BE0] text-xl group-hover:translate-x-1 transition-transform">↓</span>
              </button>
              <button onClick={() => { showToast("PDF generation coming soon.", "success"); setShowExport(false); }} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#E1E4F7] hover:border-[#5B5BE0] transition-colors text-left group">
                <div>
                  <div className="font-bold text-[#14173F]">Lender PDF Statement</div>
                  <div className="text-xs text-[#4A4F7A]">Evidence-backed summary with public QR code.</div>
                </div>
                <span className="text-[#5B5BE0] text-xl group-hover:translate-x-1 transition-transform">↓</span>
              </button>
            </div>
            
            <button onClick={() => setShowExport(false)} className="w-full py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl hover:bg-[#E6E8FA] transition-colors">Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}