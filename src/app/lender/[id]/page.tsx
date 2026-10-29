"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function LenderPortal() {
  const params = useParams();
  const [isVerified, setIsVerified] = useState(false);

  // In a real app, you would fetch the DSCR and metrics using the business ID from the URL.
  // For the hackathon, we simulate the bank-side view.

  return (
    <div className="min-h-screen bg-[#F5F1E8] p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-[#E1E4F7] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#14173F] text-white p-8 flex justify-between items-center">
          <div>
            <div className="text-[#B89A61] font-bold tracking-wider text-sm mb-1">FNB CREDIT ASSESSMENT PACKAGE</div>
            <h1 className="text-3xl font-extrabold">Siyanda's Spaza</h1>
            <p className="text-[#A9AEFF] text-sm mt-1">Business ID: {params.id} · Consent granted for 7 days</p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 px-4 py-2 rounded-lg inline-block">
              <div className="text-xs text-[#A9AEFF]">Integrity Status</div>
              <div className="text-green-400 font-bold text-lg">✓ SEALED</div>
            </div>
          </div>
        </div>

        {/* Banker Metrics */}
        <div className="p-8 grid grid-cols-3 gap-6 border-b border-[#E1E4F7]">
          <div className="bg-[#F1F2FF] p-6 rounded-xl border border-[#E1E4F7]">
            <div className="text-xs text-[#5A5F8C] font-bold uppercase mb-2">Debt-Service Coverage (DSCR)</div>
            <div className="text-4xl font-extrabold text-[#14173F]">1.8x</div>
            <div className="text-xs text-[#47745D] mt-2 font-bold">Healthy (Target: &gt;1.25x)</div>
          </div>
          <div className="bg-[#F1F2FF] p-6 rounded-xl border border-[#E1E4F7]">
            <div className="text-xs text-[#5A5F8C] font-bold uppercase mb-2">Supplier Verification</div>
            <div className="text-4xl font-extrabold text-[#14173F]">84%</div>
            <div className="text-xs text-[#47745D] mt-2 font-bold">Tier 1 & 2 Evidence</div>
          </div>
          <div className="bg-[#F1F2FF] p-6 rounded-xl border border-[#E1E4F7]">
            <div className="text-xs text-[#5A5F8C] font-bold uppercase mb-2">Revenue Volatility</div>
            <div className="text-4xl font-extrabold text-[#14173F]">Low</div>
            <div className="text-xs text-[#47745D] mt-2 font-bold">Stable 6-month trend</div>
          </div>
        </div>

        {/* Verification Action */}
        <div className="p-8 bg-[#F5F1E8]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#14173F]">Cryptographic Ledger Verification</h3>
              <p className="text-sm text-[#5A5F8C] mt-1">Scan the QR code or click verify to confirm no tampering has occurred.</p>
            </div>
            <button 
              onClick={() => setIsVerified(true)}
              className="bg-[#14173F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2A3070] transition-colors"
            >
              Verify Hash Chain
            </button>
          </div>
          {isVerified && (
            <div className="mt-4 bg-[#47745D]/10 border border-[#47745D] text-[#47745D] p-4 rounded-lg flex items-center gap-3 font-bold animate-in fade-in">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Ledger Verified: 21,093 records match their Ed25519 signatures.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}