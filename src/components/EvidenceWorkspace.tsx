"use client";

import { rands, fmtDate } from "@/lib/format";

interface RecordData {
  seq: number;
  kind: string;
  description: string;
  amount_cents: number;
  quantity: number | null;
  occurred_at: number;
  evidence_tier: string;
  status: string;
}

export default function EvidenceWorkspace({
  record,
  onClose,
}: {
  record: RecordData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#14173F]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
      <div className="bg-[#E9EBFF] w-full max-w-5xl h-[85vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-white border-b border-[#E1E4F7] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#A9AEFF]/30 p-2 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B4FC9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#14173F]">Record #{record.seq} Evidence</h2>
              <p className="text-xs text-[#4A4F7A]">{fmtDate(record.occurred_at)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F2FF] rounded-lg transition-colors text-[#5A5F8C]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Original Document */}
          <div className="flex-1 bg-[#E6E8FA] p-8 overflow-y-auto flex items-center justify-center">
            <div className="bg-white w-full max-w-sm aspect-[1/1.4] shadow-lg border border-gray-200 p-8 rounded-sm relative rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Fake Receipt Content */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <h3 className="font-mono text-xl font-bold text-gray-800 uppercase tracking-widest">Spaza Wholesale</h3>
                <p className="font-mono text-xs text-gray-500 mt-1">Makhanda, Eastern Cape</p>
                <p className="font-mono text-xs text-gray-500">VAT NO: 4920193847</p>
              </div>
              
              <div className="font-mono text-xs text-gray-600 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>DATE</span>
                  <span>{new Date(record.occurred_at).toLocaleDateString('en-ZA')}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME</span>
                  <span>14:32</span>
                </div>
                <div className="flex justify-between">
                  <span>REF</span>
                  <span>#{record.seq.toString().padStart(6, '0')}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-gray-300 py-4 mb-4 font-mono text-sm text-gray-800 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="max-w-[70%]">{record.description}</span>
                  <span className="font-bold">{rands(record.amount_cents)}</span>
                </div>
                {record.quantity && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>QTY: {record.quantity}</span>
                    <span>@ {rands(record.amount_cents / record.quantity)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-mono font-bold text-lg text-gray-800 mt-4">
                <span>TOTAL</span>
                <span>{rands(record.amount_cents)}</span>
              </div>

              <div className="mt-12 text-center">
                <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                  Thank you for your business
                </div>
                {/* Barcode mock */}
                <div className="flex justify-center gap-[2px] mt-4 opacity-50">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className={`bg-gray-800 h-8 ${i % 3 === 0 ? 'w-1' : 'w-[2px]'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Extracted Data */}
          <div className="w-full md:w-[400px] bg-white border-l border-[#E1E4F7] flex flex-col overflow-y-auto shrink-0">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#5A5F8C] uppercase tracking-widest mb-3">Extracted Data</h3>
                <div className="space-y-3">
                  <div className="bg-[#F1F2FF] rounded-xl p-4 border border-[#E1E4F7]">
                    <p className="text-[10px] font-bold text-[#5A5F8C] uppercase">Description</p>
                    <p className="text-sm font-bold text-[#14173F] mt-1">{record.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F1F2FF] rounded-xl p-4 border border-[#E1E4F7]">
                      <p className="text-[10px] font-bold text-[#5A5F8C] uppercase">Total Amount</p>
                      <p className="text-sm font-bold text-[#14173F] mt-1">{rands(record.amount_cents)}</p>
                    </div>
                    <div className="bg-[#F1F2FF] rounded-xl p-4 border border-[#E1E4F7]">
                      <p className="text-[10px] font-bold text-[#5A5F8C] uppercase">Quantity</p>
                      <p className="text-sm font-bold text-[#14173F] mt-1">{record.quantity || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#5A5F8C] uppercase tracking-widest mb-3">Evidence Status</h3>
                <div className="bg-[#FFF0C4] border border-[#D99A00] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#D99A00] uppercase tracking-wider">Tier</span>
                    <span className="text-xs font-bold text-[#14173F] uppercase">{record.evidence_tier.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-[#4A4F7A] leading-relaxed">
                    This data was extracted from the document on the left. It has been validated by deterministic code, but requires a counter-signature to reach the highest evidence tier.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#5A5F8C] uppercase tracking-widest mb-3">Cryptographic Seal</h3>
                <div className="bg-[#14173F] text-[#A9AEFF] rounded-xl p-4 font-mono text-[10px] break-all leading-relaxed">
                  <p className="text-white mb-1 opacity-50">SHA-256 HASH</p>
                  a3f9b2c1e8d74f0a9b6c5d3e2f1a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a
                </div>
              </div>

              <div className="pt-4 border-t border-[#E1E4F7] space-y-2">
                <button className="w-full py-3 bg-[#14173F] text-white font-bold rounded-xl hover:bg-[#2A3070] transition-colors">
                  Link to Supplier Invoice
                </button>
                <button className="w-full py-3 bg-[#F1F2FF] text-[#4B4FC9] font-bold rounded-xl hover:bg-[#E6E8FA] transition-colors">
                  Request Counter-signature
                </button>
              </div>

              <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] border border-[#D99A00] rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#D99A00] dark:text-[#F2B84B] uppercase tracking-wider mb-1">
                  What the seal proves
                </p>
                <p className="text-xs text-[#1D2260] dark:text-[#C5C9F5] leading-relaxed">
                  The signature confirms this record has not been altered since it was sealed. It does <strong>not</strong> confirm the underlying transaction is genuine or that extraction was accurate. Always verify against the original document.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}