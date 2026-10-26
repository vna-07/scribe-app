"use client";

import { useState, useEffect } from "react";
import type { DemoData } from "@/lib/demo-data";
import { rands, fmtDate } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { generateAnalytics } from "@/lib/analytics";
import { BarChart, DonutChart } from "@/components/Visuals";
import EvidenceWorkspace from "@/components/EvidenceWorkspace";
import ImportWizard from "@/components/ImportWizard";
import CaptureFlow from "@/components/CaptureFlow";
import SaleModal from "@/components/SaleModal";
import ExpenseModal from "@/components/ExpenseModal";
import { useApp } from "@/context/AppContext";
import StockTab from "./StockTab";
import SuppliersTab from "./SuppliersTab";
import IntelligenceTab from "./IntelligenceTab";
import GrowthTab from "./GrowthTab";
import ReportsTab from "./ReportsTab";
import OpportunitiesTab from "./OpportunitiesTab";
import { calculateCompleteness } from "@/lib/completeness";
import CompletenessCard from "@/components/CompletenessCard";

type MainTab = "overview" | "records" | "tasks" | "stock" | "intelligence" | "reports" | "opportunities" | "suppliers";

export default function DemoDashboard({ initialData }: { initialData: DemoData }) {
  const { setBusinessId, setThembaOpen } = useApp();
  
  // Set the global context when this page mounts
  useEffect(() => {
    setBusinessId(initialData.businessId);
    return () => setBusinessId(""); // Clear on unmount
  }, [initialData.businessId, setBusinessId]);

  const [data, setData] = useState<DemoData>(initialData);
  const [busy, setBusy] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("overview");
  
  const { dailyData, expenseCategories } = generateAnalytics(
    data.recentRecords.map(r => ({ ...r, prev_hash: "", canonical_hash: "", signature: "", business_id: data.businessId })) as any
  );

  // Sidebar & Mobile Nav State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modals
  const [showExport, setShowExport] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  
  const [showScamShield, setShowScamShield] = useState(false);
  const [scamMessage, setScamMessage] = useState("");
  const [scamResult, setScamResult] = useState<any>(null);
  const [scamLoading, setScamLoading] = useState(false);

  // Tasks State (kept for legacy support, though GrowthTab handles its own now)
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Evidence Workspace State
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const refetchTasks = async () => {
    try {
      const r = await fetch(`/api/tasks?business_id=${data.businessId}`);
      if (r.ok) setTasks(await r.json());
    } catch {
      // Silently ignore — Action Centre just stays stale rather than crashing
    }
  };

  // Fetch tasks on load
  useEffect(() => {
    refetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.businessId]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = async () => {
    const r = await fetch(`/api/demo/${data.businessId}`);
    if (r.ok) setData(await r.json());
    await refetchTasks();
  };

  const judgeAction = async (path: string, label: string) => {
    setBusy(label);
    try {
      const res = await fetch(`/api/judge/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business_id: data.businessId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      await refresh();
      
      if (path === "tamper") {
        setMainTab("records");
        showToast("Record tampered. The hash chain is broken.", "error");
      } else if (path === "inject") {
        showToast("Discrepancy injected. Variance updated.", "success");
      } else if (path === "reset") {
        const n = json.restored?.records ?? 0;
        const m = json.restored?.movements ?? 0;
        showToast(`Restored ${n} records and ${m} stock movements.`, "success");
      }
    } catch (e: any) {
      showToast(e.message || "Action failed.", "error");
    } finally {
      setBusy(null);
    }
  };

  const checkScam = async () => {
    if (!scamMessage.trim()) return;
    setScamLoading(true);
    setScamResult(null);
    try {
      const res = await fetch("/api/scam-shield", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: scamMessage }),
      });
      const json = await res.json();
      setScamResult(json);
    } catch {
      showToast("Could not check the message.", "error");
    } finally {
      setScamLoading(false);
    }
  };

  const weakestComponent = [...data.score.components].sort((a,b) => a.value - b.value)[0];
  const completeness = calculateCompleteness(data.recentRecords as any); // recentRecords carries the fields calculateCompleteness needs

  return (
    <div className="flex h-screen overflow-hidden bg-[#E9EBFF] text-[#14173F] font-sans relative">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 ${toast.type === "success" ? "bg-[#14173F] text-white" : "bg-[#A94E40] text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`hidden md:flex ${isCollapsed ? "w-[80px]" : "w-[260px]"} m-4 mr-0 bg-white rounded-[28px] shadow-sm flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}>
        
        <div className={`p-6 pb-2 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3">
            <Image src="/logo_symbol.png" alt="S" width={36} height={36} style={{ width: 'auto', height: 'auto' }} className="rounded-xl shadow-sm shrink-0" />
            {!isCollapsed && <span className="font-extrabold text-xl tracking-wide text-[#14173F] dark:text-white whitespace-nowrap">SCRIBE</span>}
          </div>
          {!isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="text-[#5A5F8C] hover:text-[#14173F] dark:text-[#A9AEFF]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="mx-auto mb-4 text-[#5A5F8C] hover:text-[#14173F] dark:text-[#A9AEFF]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
        
        <nav className="flex-1 p-4 space-y-1 text-sm font-semibold text-[#5A5F8C] dark:text-[#C5C9F5] overflow-y-auto overflow-x-hidden">
          {/* Navigation Items */}
          {[
            { id: "overview", label: "Overview", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
            { id: "records", label: "Records", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> },
            { id: "stock", label: "Stock", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
            { id: "suppliers", label: "Suppliers", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
            { id: "intelligence", label: "Intelligence", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"></path></svg> },
            { id: "tasks", label: "Growth Studio", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> },
            { id: "opportunities", label: "Launch Studio", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> },
            { id: "reports", label: "Reports", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => {
                if (['overview', 'records', 'tasks', 'stock', 'intelligence', 'reports', 'opportunities', 'suppliers'].includes(item.id)) setMainTab(item.id as any);
                else alert(`${item.label} module coming soon.`);
              }} 
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-2.5 rounded-xl transition-colors ${mainTab === item.id ? "bg-[#ECEEFF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF]" : "hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070]"}`}
            >
              {item.icon}
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-[#E1E4F7] dark:border-[#2A3070] space-y-1`}>
          {/* Only show to demo/admin users for the hackathon */}
          <Link
            href="/admin"
            title={isCollapsed ? "Trust Centre" : undefined}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-2.5 rounded-xl hover:bg-[#FFF0C4] dark:hover:bg-[#4A3B10] transition-colors text-left text-[#D99A00] font-bold`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            {!isCollapsed && <span className="whitespace-nowrap">Trust Centre</span>}
          </Link>

          <Link href="/settings" title={isCollapsed ? "Settings" : undefined} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-2.5 rounded-xl hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] transition-colors text-left text-[#5A5F8C] dark:text-[#A9AEFF]`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
          </Link>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 m-2 md:m-4 pb-24 md:pb-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {mainTab === "overview" ? "Molo, Nomsa" : mainTab === "records" ? "Records & Evidence" : mainTab === "stock" ? "Stock & Inventory" : mainTab === "suppliers" ? "Suppliers" : mainTab === "intelligence" ? "Business Intelligence" : mainTab === "reports" ? "Reports & Exports" : mainTab === "opportunities" ? "Launch Studio" : "Growth Studio"}
            </h1>
            <p className="text-sm font-semibold text-[#4A4F7A]">{data.businessName} · Week of 19 Oct</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:flex px-4 py-2 rounded-xl text-xs font-bold items-center gap-2 ${
              data.chain.ok ? "bg-white text-[#14173F] shadow-sm" : "bg-[#A94E40] text-white"
            }`}>
              <span className={`w-2 h-2 rounded-full ${data.chain.ok ? "bg-[#5B5BE0]" : "bg-white"}`}></span>
              {data.chain.ok ? `Ledger intact: ${data.chain.total} records` : `Tampered at #${data.chain.brokenAtSeq}`}
            </span>
            <button onClick={() => setThembaOpen(true)} className="px-4 py-2.5 rounded-xl bg-[#5B5BE0] text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span className="hidden sm:inline">Ask Themba</span>
            </button>
            <button onClick={() => setShowScamShield(true)} className="hidden sm:flex px-5 py-2.5 rounded-xl bg-white text-[#14173F] font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
              Scam Shield
            </button>
            <button onClick={() => setShowExport(true)} className="px-5 py-2.5 rounded-xl bg-white text-[#14173F] font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
              Share
            </button>
            <button onClick={() => setShowImport(true)} className="hidden sm:flex px-4 py-2.5 rounded-xl bg-white text-[#14173F] font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
              Import CSV
            </button>
            <button onClick={() => setShowSale(true)} className="hidden md:flex px-4 py-2.5 rounded-xl bg-[#14173F] text-white font-bold text-sm shadow-md hover:bg-[#2A3070] transition-colors">
              + Record Sale
            </button>
            <button onClick={() => setShowExpense(true)} className="hidden md:flex px-4 py-2.5 rounded-xl bg-white text-[#D99A00] font-bold text-sm shadow-sm hover:shadow-md transition-shadow border border-[#E1E4F7] dark:border-[#2A3070] dark:bg-[#1A1F52]">
              - Record Expense
            </button>
          </div>
        </header>

        {/* ─── OVERVIEW TAB ─── */}
        {mainTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="animate-stagger delay-1 bg-[#A9AEFF] dark:bg-[#2A3070] rounded-[24px] p-5 shadow-sm">
                <div className="text-xs font-bold text-[#1D2260] mb-1">Total recorded sales</div>
                <div className="text-2xl font-extrabold tracking-tight tabular-nums">{rands(data.revenue.low_cents)}</div>
                <div className="text-xs font-medium text-[#1D2260] mt-2 tabular-nums">Range to {rands(data.revenue.high_cents)}</div>
              </div>
              <div className="animate-stagger delay-2 bg-white/60 dark:bg-[#1A1F52] backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-white/50 dark:border-[#2A3070]">
                <div className="text-xs font-bold text-[#4A4F7A] mb-1">Cash on hand</div>
                <div className="text-2xl font-extrabold tracking-tight tabular-nums">R3 245</div>
                <div className="text-xs font-medium text-[#4A4F7A] mt-2">Reported Friday 16:40</div>
              </div>
              <div className="animate-stagger delay-3 bg-white/60 dark:bg-[#1A1F52] backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-white/50 dark:border-[#2A3070]">
                <div className="text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Stock gaps to review</div>
                <div className={`text-2xl font-extrabold tracking-tight tabular-nums ${data.stockState.open_variances > 0 ? "text-[#D99A00]" : "text-[#47745D]"}`}>
                  {data.stockState.open_variances} {data.stockState.open_variances === 1 ? "product" : "products"}
                </div>
                <div className="text-xs font-medium text-[#4A4F7A] dark:text-[#C5C9F5] mt-2">
                  {data.stockState.total_products} tracked · {data.stockState.with_variance} with variance
                </div>
              </div>
              <div className="animate-stagger delay-4 bg-[#14173F] dark:bg-[#0E1130] rounded-[24px] p-5 shadow-md text-white">
                <div className="text-xs font-bold text-[#C5C9F5] mb-1">Consistency Score</div>
                <div className="text-2xl font-extrabold tracking-tight text-[#A9AEFF] tabular-nums">{data.score.low}–{data.score.high}</div>
                <div className="text-xs font-medium text-[#C5C9F5] mt-2">Evidence of readiness</div>
              </div>
            </div>

            <CompletenessCard data={completeness} />

            {/* ─── ACTION CENTRE ─── */}
            <div className="animate-stagger bg-white dark:bg-[#1A1F52] rounded-[24px] p-6 border border-[#E1E4F7] dark:border-[#2A3070] shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#D99A00] animate-pulse"></span>
                <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg">Action Centre</h3>
              </div>
              
              <div className="space-y-3">
                {data.stockState.products.filter(p => p.status === "open").map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-[#FFF0C4] dark:bg-[#4A3B10] border border-[#D99A00]">
                    <div>
                      <p className="font-bold text-[#1D2260] dark:text-[#F2B84B] text-sm">
                        {p.name} — {p.variance! > 0 ? "+" : ""}{p.variance} {p.unit}s {p.variance! < 0 ? "short" : "over"}
                      </p>
                      <p className="text-xs text-[#1D2260] dark:text-[#C5C9F5] mt-0.5">
                        Expected {p.expected} · Counted {p.counted}
                      </p>
                    </div>
                    <button onClick={() => setThembaOpen(true)} className="mt-3 sm:mt-0 px-4 py-2 bg-[#14173F] text-white text-xs font-bold rounded-lg hover:bg-[#2A3070]">
                      Ask Themba
                    </button>
                  </div>
                ))}

                {tasks.filter(t => t.status === 'pending').length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080]">
                    <div>
                      <p className="font-bold text-[#14173F] dark:text-white text-sm">You have {tasks.filter(t => t.status === 'pending').length} pending tasks</p>
                      <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mt-0.5">Review your Growth Studio to keep momentum.</p>
                    </div>
                    <button onClick={() => setMainTab("tasks")} className="mt-3 sm:mt-0 px-4 py-2 bg-white text-[#5B5BE0] text-xs font-bold rounded-lg border border-[#E1E4F7] hover:bg-[#F1F2FF]">
                      View Tasks
                    </button>
                  </div>
                )}

                {data.stockState.open_variances === 0 && tasks.filter(t => t.status === 'pending').length === 0 && (
                  <div className="p-4 rounded-xl bg-[#47745D]/10 border border-[#47745D]/20 text-center">
                    <p className="text-sm font-bold text-[#47745D] dark:text-[#A9AEFF]">You're all caught up! No outstanding actions.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="animate-stagger delay-5 flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 bg-white/90 rounded-[28px] p-4 md:p-6 shadow-sm border border-white/50">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-lg">Daily Cash Flow</h3>
                    <p className="text-xs font-medium text-[#4A4F7A]">Sales vs Expenses over the past 14 days.</p>
                  </div>
                </div>
                <BarChart data={dailyData} />
              </div>

              <div className="flex-1 bg-white/90 rounded-[28px] p-4 md:p-6 shadow-sm border border-white/50">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-extrabold text-lg">Trading Consistency Score</h3>
                    <p className="text-xs font-medium text-[#4A4F7A]">Click a component to see how to improve it.</p>
                  </div>
                  <span className="font-extrabold text-2xl text-[#5B5BE0] tabular-nums">{data.score.low}–{data.score.high}</span>
                </div>
                <div className="space-y-4">
                  {data.score.components.map(c => (
                    <div key={c.key} className="cursor-pointer group">
                      <div className="flex justify-between text-xs font-bold mb-1 group-hover:text-[#5B5BE0] transition-colors">
                        <span>{c.label}</span>
                        <span className="tabular-nums">{Math.round(c.value * 100)}</span>
                      </div>
                      <div className="h-2 w-full bg-[#E6E8FA] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${c.value > 0.6 ? 'bg-[#14173F]' : c.value > 0.3 ? 'bg-[#A9AEFF]' : 'bg-[#D99A00]'}`} style={{ width: `${Math.max(5, c.value * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 border-t border-[#E1E4F7] pt-6">
                  <h3 className="font-extrabold text-sm mb-3">Expense Breakdown</h3>
                  <DonutChart data={expenseCategories} />
                </div>

                <div className="mt-5 bg-[#FFF0C4] rounded-xl p-3 text-xs font-bold leading-relaxed text-[#1D2260]">
                  Weakest component: {weakestComponent.label}. {data.score.counterfactuals[0]?.action || "Keep recording to improve."}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 bg-white/90 rounded-[28px] p-4 md:p-6 shadow-sm border border-white/50">
                <h3 className="font-extrabold text-lg mb-4">Stock reconciliation</h3>
                <div className="space-y-2">
                  {data.stockState.products.slice(0, 6).map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-[#E1E4F7] last:border-0">
                      <span className="font-medium text-[#14173F] truncate max-w-[50%]">{p.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-[#5A5F8C] tabular-nums">Expected {p.expected}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
                          p.status === "open" ? "bg-[#FFF0C4] text-[#D99A00]" :
                          p.status === "reconciled" ? "bg-[#47745D]/10 text-[#47745D]" :
                          "bg-[#E1E4F7] text-[#5A5F8C]"
                        }`}>
                          {p.status === "no_count" ? "No count" : p.variance === 0 ? "✓ Matched" : `${p.variance! > 0 ? "+" : ""}${p.variance}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-[#E1E4F7] pt-4 mt-4">
                  <p className="text-xs font-bold text-[#14173F] mb-2 uppercase tracking-wider">Judge Mode</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => judgeAction("inject-discrepancy", "inject")} disabled={!!busy} className="px-3 py-2 bg-[#F1F2FF] text-[#4B4FC9] hover:bg-[#E6E8FA] rounded-lg text-xs font-bold transition-colors">
                      {busy === "inject" ? "Working..." : "Inject Discrepancy"}
                    </button>
                    <button onClick={() => judgeAction("tamper", "tamper")} disabled={!!busy} className="px-3 py-2 bg-[#F1F2FF] text-[#4B4FC9] hover:bg-[#E6E8FA] rounded-lg text-xs font-bold transition-colors">
                      {busy === "tamper" ? "Working..." : "Try to Cheat"}
                    </button>
                    <button onClick={() => judgeAction("reset", "reset")} disabled={!!busy} className="px-3 py-2 bg-white border border-[#E1E4F7] text-[#4A4F7A] hover:text-[#14173F] rounded-lg text-xs font-bold transition-colors">
                      {busy === "reset" ? "Restoring..." : "Restore Demo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── RECORDS TAB ─── */}
        {mainTab === "records" && (
          <div className="bg-white/90 rounded-[28px] p-4 md:p-6 shadow-sm border border-white/50 flex-1 overflow-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold">Forensic Ledger</h2>
                <p className="text-sm text-[#4A4F7A]">Every record is cryptographically signed. Any edit will break the chain.</p>
              </div>
              <button onClick={() => setShowCapture(true)} className="px-4 py-2 bg-[#14173F] text-white rounded-lg text-sm font-bold w-full sm:w-auto">
                + Add Record
              </button>
            </div>

            {/* FORENSIC BREAK BANNER */}
            {!data.chain.ok && (
              <div className="bg-[#A94E40] text-white rounded-2xl p-4 md:p-6 mb-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Cryptographic Alert: Ledger Tampered
                  </h3>
                  <p className="text-[#F5F1E8] mt-1 text-sm font-medium">
                    The chain is broken at Record #{data.chain.brokenAtSeq}. The stored hash no longer matches the record's contents. All subsequent records are invalid.
                  </p>
                </div>
                <button onClick={() => judgeAction("reset", "reset")} disabled={!!busy} className="bg-white text-[#A94E40] font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-100 transition-colors shrink-0 w-full md:w-auto disabled:opacity-50">
                  {busy === "reset" ? "Restoring..." : "Restore Clean State"}
                </button>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
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
                  {data.recentRecords.map(r => {
                    const isTampered = data.chain?.brokenAtSeq === r.seq;
                    const isAfterBreak = data.chain?.brokenAtSeq !== null && r.seq > (data.chain?.brokenAtSeq ?? Infinity);
                    
                    return (
                      <tr 
                        key={r.seq} 
                        onClick={() => setSelectedRecord(r)}
                        className={`cursor-pointer group transition-colors ${
                          isTampered ? "bg-[#A94E40]/10 border-l-4 border-l-[#A94E40]" : 
                          isAfterBreak ? "bg-red-50/30 opacity-50" : 
                          "hover:bg-[#F1F2FF]/50"
                        }`}
                      >
                        <td className={`p-4 font-bold tabular-nums ${isTampered ? "text-[#A94E40]" : "text-[#5B5BE0]"}`}>#{r.seq}</td>
                        <td className="p-4 text-[#4A4F7A] tabular-nums">{fmtDate(r.occurred_at)}</td>
                        <td className="p-4 font-medium">
                          {r.description}
                          {isTampered && <span className="ml-2 text-[10px] font-bold uppercase text-[#A94E40] bg-[#A94E40]/10 px-2 py-0.5 rounded-full">Tampered</span>}
                        </td>
                        <td className={`p-4 font-bold tabular-nums ${isTampered ? "text-[#A94E40]" : ""}`}>{rands(r.amount_cents)}</td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg ${
                            r.evidence_tier === "counter_signed" ? "bg-[#47745D]/10 text-[#47745D]" : 
                            r.evidence_tier === "document_supported" ? "bg-[#A9AEFF]/20 text-[#4B4FC9]" : "bg-[#E6E8FA] text-[#4A4F7A]"
                          }`}>
                            {r.evidence_tier.replace("_", " ")}
                          </span>
                        </td>
                        <td className={`p-4 text-xs font-mono truncate max-w-[120px] ${isTampered ? "text-[#A94E40] line-through decoration-2" : "text-[#5A5F8C]"}`} title="Cryptographic hash">
                          {r.canonical_hash ? r.canonical_hash.slice(0, 16) + "..." : "hash"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── STOCK TAB ─── */}
        {mainTab === "stock" && (
          <div className="flex-1 overflow-auto">
            <StockTab businessId={data.businessId} onRefresh={refresh} />
          </div>
        )}

        {/* ─── SUPPLIERS TAB ─── */}
        {mainTab === "suppliers" && (
          <div className="flex-1 overflow-auto">
            <SuppliersTab businessId={data.businessId} />
          </div>
        )}

        {/* ─── INTELLIGENCE TAB ─── */}
        {mainTab === "intelligence" && (
          <div className="flex-1 overflow-auto">
            <IntelligenceTab data={data} onRefresh={refresh} />
          </div>
        )}

        {/* ─── LAUNCH STUDIO TAB ─── */}
        {mainTab === "opportunities" && (
          <div className="flex-1 overflow-auto">
            <OpportunitiesTab businessId={data.businessId} />
          </div>
        )}

        {/* ─── TASKS / GROWTH STUDIO TAB ─── */}
        {mainTab === "tasks" && (
          <div className="flex-1 overflow-auto">
            <GrowthTab businessId={data.businessId} onTasksChanged={refresh} />
          </div>
        )}

        {/* ─── REPORTS TAB ─── */}
        {mainTab === "reports" && (
          <div className="flex-1 overflow-auto">
            <ReportsTab businessId={data.businessId} data={data} />
          </div>
        )}
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION ─── */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1A1F52]/90 backdrop-blur-xl border-t border-[#E1E4F7] dark:border-[#2A3070] px-2 pt-2 flex justify-around items-center z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {[
          { id: "overview", label: "Home", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
          { id: "records", label: "Records", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> },
          { id: "stock", label: "Stock", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
          { id: "themba", label: "Themba", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> },
          { id: "more", label: "More", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg> }
        ].map((tab) => {
          const isActive = mainTab === tab.id || (tab.id === "more" && ["intelligence", "tasks", "reports", "opportunities"].includes(mainTab));
          return (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id === "themba") setThembaOpen(true);
                else if (tab.id === "more") setShowMore(true);
                else setMainTab(tab.id as any);
              }} 
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? "bg-[#ECEEFF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF]" 
                  : "text-[#5A5F8C] dark:text-[#C5C9F5] hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070]"
              }`}
            >
              <div className={`transition-transform ${isActive ? "scale-110" : ""}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── CAPTURE FLOW MODAL ─── */}
      {showCapture && (
        <CaptureFlow 
          businessId={data.businessId} 
          onComplete={refresh} 
          onClose={() => setShowCapture(false)} 
        />
      )}

      {/* ─── SALE MODAL ─── */}
      {showSale && (
        <SaleModal 
          businessId={data.businessId} 
          onComplete={refresh} 
          onClose={() => setShowSale(false)} 
        />
      )}

      {/* ─── EXPENSE MODAL ─── */}
      {showExpense && (
        <ExpenseModal 
          businessId={data.businessId} 
          onComplete={refresh} 
          onClose={() => setShowExpense(false)} 
        />
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
              <Link href={`/statement/${data.businessId}`} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#E1E4F7] hover:border-[#5B5BE0] transition-colors text-left group">
                <div>
                  <div className="font-bold text-[#14173F]">Lender PDF Statement</div>
                  <div className="text-xs text-[#4A4F7A]">Evidence-backed summary with public QR code.</div>
                </div>
                <span className="text-[#5B5BE0] text-xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            
            <button onClick={() => setShowExport(false)} className="w-full py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl hover:bg-[#E6E8FA] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── SCAM SHIELD MODAL ─── */}
      {showScamShield && (
        <div className="fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-[#14173F] flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                  <path d="M12 9v4M12 16h.01" />
                </svg>
                Scam Shield
              </h2>
            </div>
            <p className="text-sm text-[#4A4F7A] mb-6">
              Paste a suspicious WhatsApp, SMS or email message. I'll flag risk signals — not judge the sender.
            </p>

            <textarea
              value={scamMessage}
              onChange={(e) => { setScamMessage(e.target.value); setScamResult(null); }}
              placeholder="e.g. URGENT: New banking details. Please pay the R2 500 deposit to this account before delivery today."
              rows={5}
              className="w-full bg-[#F1F2FF] border border-[#E1E4F7] rounded-xl p-4 text-sm text-[#14173F] focus:border-[#5B5BE0] outline-none resize-none mb-4"
            />

            <button
              onClick={checkScam}
              disabled={scamLoading || !scamMessage.trim()}
              className="w-full py-3 bg-[#14173F] text-white font-bold rounded-xl hover:bg-[#2A3070] transition-colors disabled:opacity-50 mb-4"
            >
              {scamLoading ? "Analysing…" : "Check message"}
            </button>

            {scamResult && (
              <div className="space-y-4">
                <div
                  className={`rounded-xl p-4 border-2 ${
                    scamResult.risk === "high"
                      ? "bg-[#A94E40]/10 border-[#A94E40]"
                      : scamResult.risk === "medium"
                      ? "bg-[#FFF0C4] border-[#D99A00]"
                      : "bg-[#47745D]/10 border-[#47745D]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#14173F]">
                      Risk: {scamResult.risk}
                    </span>
                    <span className="text-xs font-bold text-[#4A4F7A] tabular-nums">
                      Score: {scamResult.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-[#14173F] font-semibold leading-relaxed">
                    {scamResult.summary}
                  </p>
                </div>

                {scamResult.signals.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#5A5F8C] uppercase tracking-wider mb-2">
                      Signals detected
                    </p>
                    <div className="space-y-2">
                      {scamResult.signals.map((s: any, i: number) => (
                        <div key={i} className="bg-[#F1F2FF] rounded-lg p-3 border border-[#E1E4F7]">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                s.severity === "high"
                                  ? "bg-[#A94E40]"
                                  : s.severity === "medium"
                                  ? "bg-[#D99A00]"
                                  : "bg-[#5A5F8C]"
                              }`}
                            />
                            <span className="text-xs font-bold text-[#14173F]">{s.signal}</span>
                          </div>
                          <p className="text-xs text-[#4A4F7A] leading-relaxed">{s.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scamResult.advice.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#5A5F8C] uppercase tracking-wider mb-2">
                      What to do
                    </p>
                    <ul className="space-y-1.5">
                      {scamResult.advice.map((a: string, i: number) => (
                        <li key={i} className="text-sm text-[#14173F] leading-relaxed flex gap-2">
                          <span className="text-[#5B5BE0] font-bold shrink-0">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-[#5A5F8C] leading-relaxed italic border-t border-[#E1E4F7] pt-3">
                  {scamResult.disclaimer}
                </p>
              </div>
            )}

            <button
              onClick={() => { setShowScamShield(false); setScamMessage(""); setScamResult(null); }}
              className="w-full mt-4 py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl hover:bg-[#E6E8FA] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── EVIDENCE WORKSPACE ─── */}
      {selectedRecord && (
        <EvidenceWorkspace 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}

      {/* ─── IMPORT WIZARD ─── */}
      {showImport && (
        <ImportWizard 
          businessId={data.businessId} 
          onComplete={refresh} 
          onClose={() => setShowImport(false)} 
        />
      )}

      {/* ─── MOBILE MORE MENU ─── */}
      {showMore && (
        <div className="md:hidden fixed inset-0 bg-[#14173F]/50 backdrop-blur-sm z-50 flex items-end justify-center pb-16">
          <div className="bg-white dark:bg-[#1A1F52] w-full max-w-sm rounded-t-[28px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">More</h2>
              <button onClick={() => setShowMore(false)} className="text-[#5A5F8C] hover:text-[#14173F] dark:text-[#A9AEFF]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="space-y-2">
              <button onClick={() => { setMainTab("intelligence"); setShowMore(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] font-bold text-sm text-[#14173F] dark:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"></path></svg>
                Business Intelligence
              </button>
              <button onClick={() => { setMainTab("tasks"); setShowMore(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] font-bold text-sm text-[#14173F] dark:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                Growth Studio
              </button>
              <button onClick={() => { setMainTab("opportunities"); setShowMore(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] font-bold text-sm text-[#14173F] dark:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                Launch Studio
              </button>
              <button onClick={() => { setMainTab("reports"); setShowMore(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] font-bold text-sm text-[#14173F] dark:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Reports
              </button>
            </div>
            <div className="border-t border-[#E1E4F7] dark:border-[#2A3070] mt-4 pt-4">
              <Link href="/settings" className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F1F2FF] dark:hover:bg-[#2A3070] font-bold text-sm text-[#5A5F8C] dark:text-[#A9AEFF] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}