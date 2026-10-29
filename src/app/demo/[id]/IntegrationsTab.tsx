"use client";

export default function IntegrationsTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white">Explore Integrations</h2>
          <span className="bg-[#B89A61]/20 text-[#B89A61] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Roadmap
          </span>
        </div>
        <p className="text-[#4A4F7A] dark:text-[#C5C9F5]">
          Connect SCRIBE to the tools that run your business.
        </p>
      </div>

      {/* Hero Card: POS */}
      <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] px-4 py-1.5 rounded-bl-xl text-xs font-bold">
          Proposed integration · Not yet available
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-[#5B5BE0]/10 flex items-center justify-center text-[#5B5BE0]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8h.01"></path><path d="M10 8h.01"></path><path d="M14 8h.01"></path><path d="M18 8h.01"></path><path d="M6 12h.01"></path><path d="M10 12h.01"></path><path d="M14 12h.01"></path><path d="M18 12h.01"></path><path d="M6 16h.01"></path><path d="M10 16h.01"></path><path d="M14 16h.01"></path><path d="M18 16h.01"></path></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#14173F] dark:text-white">POS & Sales Integration</h3>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Connect point-of-sale systems to feed sales, refunds, and transaction summaries into reporting.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#F5F1E8] dark:bg-[#14173F] p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070]">
            <h4 className="font-bold text-sm text-[#14173F] dark:text-white mb-2">Sales Records</h4>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Automated capture of sales and refunds.</p>
          </div>
          <div className="bg-[#F5F1E8] dark:bg-[#14173F] p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070]">
            <h4 className="font-bold text-sm text-[#14173F] dark:text-white mb-2">Stock Reconciliation</h4>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Compare recorded sales with expected movements.</p>
          </div>
          <div className="bg-[#F5F1E8] dark:bg-[#14173F] p-4 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070]">
            <h4 className="font-bold text-sm text-[#14173F] dark:text-white mb-2">Cash-up Checks</h4>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Compare POS totals against cash counts.</p>
          </div>
        </div>

        <div className="p-4 bg-[#FFF0C4] dark:bg-[#4A3B10]/30 rounded-xl border border-[#D99A00]/20 mb-6">
          <p className="text-xs text-[#D99A00] font-medium leading-relaxed">
            <strong>Note on Evidence:</strong> A POS transaction is evidence that the system recorded a sale, not necessarily proof that the customer paid or that the cash reached the bank. SCRIBE keeps these distinctions explicit.
          </p>
        </div>

        <button className="bg-[#5B5BE0] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#4B4FC9] transition-colors shadow-sm opacity-50 cursor-not-allowed" disabled>
          Explore Integration Plan
        </button>
      </div>

      {/* Secondary Roadmap Grid */}
      <div>
        <h3 className="text-lg font-bold text-[#14173F] dark:text-white mb-4">Other Proposed Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] opacity-75">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[#14173F] dark:text-white">Bank & Payment Records</h4>
            </div>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Statement imports and payment reconciliation.</p>
            <span className="inline-block mt-3 text-[10px] uppercase font-bold text-[#5A5F8C] bg-[#E1E4F7] dark:bg-[#2A3070] px-2 py-1 rounded-full">Proposed</span>
          </div>

          <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] opacity-75">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[#14173F] dark:text-white">Suppliers & Inventory</h4>
            </div>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Purchase orders, invoices, and stock receipts.</p>
            <span className="inline-block mt-3 text-[10px] uppercase font-bold text-[#5A5F8C] bg-[#E1E4F7] dark:bg-[#2A3070] px-2 py-1 rounded-full">Proposed</span>
          </div>

          <div className="bg-white dark:bg-[#1A1F52] p-5 rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] opacity-75">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[#14173F] dark:text-white">Accounting Exports</h4>
            </div>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">Structured exports to accounting tools.</p>
            <span className="inline-block mt-3 text-[10px] uppercase font-bold text-[#5A5F8C] bg-[#E1E4F7] dark:bg-[#2A3070] px-2 py-1 rounded-full">Proposed</span>
          </div>

        </div>
      </div>
    </div>
  );
}