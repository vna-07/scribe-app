"use client";

import { useState } from "react";

export default function IntegrationsTab() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Fragmented records",
      subtitle: "Before connection",
      desc: "Sales are in one system, supplier invoices in another, and physical stock counts in a notebook. These sources are not yet reconciled.",
      visual: (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#14173F] p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] text-center">
            <div className="text-xs text-[#5A5F8C] mb-1">POS Sales</div>
            <div className="text-lg font-bold text-[#14173F] dark:text-white">R4,850</div>
          </div>
          <div className="bg-white dark:bg-[#14173F] p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] text-center">
            <div className="text-xs text-[#5A5F8C] mb-1">Supplier Invoice</div>
            <div className="text-lg font-bold text-[#14173F] dark:text-white">R3,200</div>
          </div>
          <div className="bg-white dark:bg-[#14173F] p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] text-center">
            <div className="text-xs text-[#5A5F8C] mb-1">Stock Count</div>
            <div className="text-lg font-bold text-[#14173F] dark:text-white">Manual</div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Connect the sales data",
      subtitle: "Step 2",
      desc: "The proposed connection imports sales and refunds via API or validated file export. SCRIBE maps the fields, checks for duplicates, and validates the data.",
      visual: (
        <div className="bg-white dark:bg-[#14173F] p-6 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] flex items-center justify-between">
          <div className="text-center">
            <div className="text-sm font-bold text-[#14173F] dark:text-white mb-1">POS Export</div>
            <div className="text-xs text-[#5A5F8C]">CSV / API</div>
          </div>
          <div className="text-[#5B5BE0] font-bold text-xl">→</div>
          <div className="text-center">
            <div className="text-sm font-bold text-[#5B5BE0] mb-1">SCRIBE Import</div>
            <div className="text-xs text-[#5A5F8C]">Mapping & Validation</div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Reconcile and explain",
      subtitle: "Step 3",
      desc: "SCRIBE compares POS data with stock records, invoices, and physical counts. It flags differences and links every finding to its supporting source records.",
      visual: (
        <div className="bg-[#FFF0C4] dark:bg-[#4A3B10]/30 p-4 rounded-xl border border-[#D99A00]/30 flex items-start gap-3">
          <div className="text-[#D99A00] mt-0.5">⚠️</div>
          <div>
            <div className="text-sm font-bold text-[#D99A00]">Discrepancy Found</div>
            <div className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">POS recorded 50 units sold. Stock records show 42 units deducted. 8 units unaccounted for.</div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Take action",
      subtitle: "Step 4",
      desc: "The trader reviews discrepancies, corrects records, and produces clearer summaries. The integration supports decisions; it does not automatically prove fraud.",
      visual: (
        <div className="bg-[#47745D]/10 p-4 rounded-xl border border-[#47745D]/30 flex items-center justify-between">
          <div className="text-sm font-bold text-[#47745D]">Create Investigation Case</div>
          <div className="text-xs font-bold text-white bg-[#47745D] px-3 py-1 rounded-full">Action</div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-extrabold text-[#14173F] dark:text-white tracking-tight">SCRIBE Integrations</h2>
          <span className="bg-[#B89A61]/20 text-[#B89A61] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Roadmap</span>
        </div>
        <p className="text-lg text-[#4A4F7A] dark:text-[#C5C9F5]">
          One business. Connected records. Clearer decisions.
        </p>
      </div>

      {/* Standalone vs Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border-2 border-[#E1E4F7] dark:border-[#2A3070]">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#47745D]"></div>
            <h3 className="font-bold text-[#14173F] dark:text-white">Standalone Mode Available</h3>
          </div>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
            SCRIBE delivers value on day one. Use manual entry, voice capture, receipts, and supported documents without connecting anything.
          </p>
        </div>
        <div className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border-2 border-[#5B5BE0] dark:border-[#5B5BE0] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#5B5BE0] text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider">Next Stage</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#5B5BE0]"></div>
            <h3 className="font-bold text-[#14173F] dark:text-white">Integration Roadmap</h3>
          </div>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">
            Connect the systems you already use. Reconcile information across sources and turn fragmented activity into clearer operations.
          </p>
        </div>
      </div>

      {/* POS Flagship Card */}
      <div className="bg-white dark:bg-[#1A1F52] rounded-3xl border border-[#E1E4F7] dark:border-[#2A3070] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#E1E4F7] dark:border-[#2A3070]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-[#14173F] dark:text-white">POS & Sales Systems</h3>
                <span className="bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] px-3 py-1 rounded-full text-xs font-bold">Proposed</span>
              </div>
              <p className="text-[#4A4F7A] dark:text-[#C5C9F5] max-w-2xl">
                Bring sales, refunds, and available stock movements into one reconciliation workflow. Explore the proposed workflow and the business problem it solves.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-[#F5F1E8] dark:bg-[#14173F] p-8">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  activeStep === s.id
                    ? "bg-[#5B5BE0] text-white"
                    : "bg-white dark:bg-[#1A1F52] text-[#5A5F8C] dark:text-[#C5C9F5] border border-[#E1E4F7] dark:border-[#2A3070]"
                }`}
              >
                {s.id}. {s.title}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#1A1F52] rounded-2xl p-8 border border-[#E1E4F7] dark:border-[#2A3070] shadow-sm min-h-[200px] flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5B5BE0] uppercase tracking-wider mb-2">{steps[activeStep - 1].subtitle}</div>
              <h4 className="text-xl font-bold text-[#14173F] dark:text-white mb-3">{steps[activeStep - 1].title}</h4>
              <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-6">
                {steps[activeStep - 1].desc}
              </p>
            </div>
            <div>{steps[activeStep - 1].visual}</div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-xs text-[#5A5F8C]">Illustrative data and proposed workflow. Not a live POS connection.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                className="px-4 py-2 rounded-lg text-sm font-bold border border-[#E1E4F7] dark:border-[#2A3070] disabled:opacity-50"
              >
                Back
              </button>
              <button 
                onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
                disabled={activeStep === 4}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-[#5B5BE0] text-white disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Problem vs Solution Table */}
      <div>
        <h3 className="text-xl font-bold text-[#14173F] dark:text-white mb-4">What problem does this solve?</h3>
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F1F2FF] dark:bg-[#2A3070] text-[#14173F] dark:text-white">
              <tr>
                <th className="p-4 font-bold">The Problem</th>
                <th className="p-4 font-bold">What the integration enables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E4F7] dark:divide-[#2A3070]">
              <tr>
                <td className="p-4 text-[#4A4F7A] dark:text-[#C5C9F5]">Sales must be entered again manually.</td>
                <td className="p-4 font-medium text-[#14173F] dark:text-white">Import supported sales records instead of retyping them.</td>
              </tr>
              <tr>
                <td className="p-4 text-[#4A4F7A] dark:text-[#C5C9F5]">Sales and stock records disagree.</td>
                <td className="p-4 font-medium text-[#14173F] dark:text-white">Compare sales quantities against expected stock movements.</td>
              </tr>
              <tr>
                <td className="p-4 text-[#4A4F7A] dark:text-[#C5C9F5]">Cash-up totals are unclear.</td>
                <td className="p-4 font-medium text-[#14173F] dark:text-white">Compare POS totals with counted cash and payment evidence.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 bg-[#FFF0C4] dark:bg-[#4A3B10]/30 p-4 rounded-xl border border-[#D99A00]/20">
          <p className="text-xs text-[#D99A00] font-medium leading-relaxed">
            <strong>Important boundary:</strong> A POS records what the system says happened. It does not independently prove a customer paid or that cash reached the bank. SCRIBE keeps those distinctions explicit.
          </p>
        </div>
      </div>

      {/* Roadmap Visual */}
      <div>
        <h3 className="text-xl font-bold text-[#14173F] dark:text-white mb-6">Implementation Roadmap</h3>
        <div className="space-y-4">
          {[
            { stage: "Stage 0", title: "Standalone foundation", status: "Current", color: "bg-[#47745D]" },
            { stage: "Stage 1", title: "Discover and design (Identify POS systems)", status: "Next", color: "bg-[#5B5BE0]" },
            { stage: "Stage 2", title: "Build the first import (CSV validation)", status: "MVP", color: "bg-[#5B5BE0]" },
            { stage: "Stage 3", title: "Reconciliation engine (Compare sources)", status: "Planned", color: "bg-[#E1E4F7] dark:bg-[#2A3070]" },
            { stage: "Stage 4", title: "Automated connection (API sync)", status: "Future", color: "bg-[#E1E4F7] dark:bg-[#2A3070]" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-24 text-right text-xs font-bold ${item.status === "Current" ? "text-[#47745D]" : "text-[#5A5F8C]"}`}>
                {item.stage}
              </div>
              <div className={`h-4 w-4 rounded-full ${item.color} z-10 shrink-0`}></div>
              <div className="flex-1 bg-white dark:bg-[#1A1F52] p-3 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] flex justify-between items-center">
                <span className="text-sm font-bold text-[#14173F] dark:text-white">{item.title}</span>
                <span className="text-[10px] font-bold uppercase text-[#5A5F8C] bg-[#F1F2FF] dark:bg-[#2A3070] px-2 py-1 rounded-full">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggest an integration CTA */}
      <div className="bg-[#14173F] rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Which tools does your business use?</h3>
        <p className="text-sm text-[#C5C9F5] mb-6">Help us prioritise future integrations. Tell us what POS, accounting, or supplier systems you use.</p>
        <button className="bg-[#5B5BE0] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#4B4FC9] transition-colors">
          Suggest an Integration
        </button>
      </div>
    </div>
  );
}