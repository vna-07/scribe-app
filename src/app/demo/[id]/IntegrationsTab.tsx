"use client";

import { useState } from "react";

export default function IntegrationsTab() {
  const [activeStep, setActiveStep] = useState(1);
  const [showWaModal, setShowWaModal] = useState(false);

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

      {/* Chat Apps Section */}
      <div className="mt-12 pt-12 border-t border-[#E1E4F7] dark:border-[#2A3070]">
        <h3 className="text-xl font-bold text-[#14173F] dark:text-white mb-6">Connect your Chat Apps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Telegram (Active) */}
          <a
            href="https://t.me/ScribeIntellegenceBot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border-2 border-[#229ED9]/30 hover:border-[#229ED9] transition-colors group flex items-center justify-between shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-[#14173F] dark:text-white group-hover:text-[#229ED9] transition-colors">Telegram Bot</h4>
                <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Capture records & ask Themba via chat.</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase bg-[#229ED9] text-white px-2.5 py-1 rounded-full">Live</span>
          </a>

          {/* WhatsApp (Mock) */}
          <button
            onClick={() => setShowWaModal(true)}
            className="bg-white dark:bg-[#1A1F52] p-6 rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] hover:border-[#25D366]/50 transition-colors group flex items-center justify-between shadow-sm text-left w-full opacity-80 cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-[#14173F] dark:text-white">WhatsApp Bot</h4>
                <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Coming soon to meet you where you are.</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase bg-[#E1E4F7] dark:bg-[#2A3070] text-[#5A5F8C] px-2.5 py-1 rounded-full">Planned</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Modal Popup */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1A1F52] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="h-16 w-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
            </div>
            <h3 className="text-xl font-bold text-[#14173F] dark:text-white mb-2">Still building this!</h3>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">
              We are actively working on the WhatsApp integration to meet traders where they are. For now, try our live Telegram bot!
            </p>
            <button onClick={() => setShowWaModal(false)} className="w-full bg-[#14173F] dark:bg-white text-white dark:text-[#14173F] font-bold py-2.5 rounded-xl hover:bg-[#2A3070] transition-colors">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}