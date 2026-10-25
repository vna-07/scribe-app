"use client";

import { useState } from "react";

const OPPORTUNITIES = [
  {
    id: "nyda",
    title: "NYDA Grant Programme",
    provider: "National Youth Development Agency",
    type: "Grant",
    amount: "R1,000 - R250,000",
    eligibility: "Youth aged 18-35, South African citizen, valid business plan.",
    requires: ["ID Copy", "Business Plan", "Proof of Residence"],
    link: "https://www.nyda.gov.za"
  },
  {
    id: "sefa",
    title: "SEFA Small Business Loan",
    provider: "Small Enterprise Finance Agency",
    type: "Loan",
    amount: "Up to R15 Million",
    eligibility: "Existing SMEs with 12 months trading history.",
    requires: ["6 Months Bank Statements", "Financial Statements", "Business Registration"],
    link: "https://www.sefa.org.za"
  },
  {
    id: "youth-challenge",
    title: "Youth Challenge Fund",
    provider: "Department of Small Business Development",
    type: "Grant",
    amount: "R500,000",
    eligibility: "Youth-owned businesses, 100% black-owned.",
    requires: ["Business Profile", "Tax Clearance", "Pitch Deck"],
    link: "https://www.dsbd.gov.za"
  }
];

export default function OpportunitiesTab({ businessId }: { businessId: string }) {
  const [saved, setSaved] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Opportunities</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Funding and support matched to your profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPPORTUNITIES.map(opp => (
          <div key={opp.id} className="bg-white dark:bg-[#1A1F52] border border-[#E1E4F7] dark:border-[#2A3070] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] px-2 py-1 rounded">
                  {opp.type}
                </span>
                <button onClick={() => toggleSave(opp.id)} className={`text-xl ${saved.includes(opp.id) ? "text-[#D99A00]" : "text-gray-300 hover:text-[#D99A00]"}`}>
                  ★
                </button>
              </div>
              <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg leading-tight mb-1">{opp.title}</h3>
              <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mb-4">{opp.provider}</p>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm font-bold text-[#14173F] dark:text-white">Value: {opp.amount}</p>
                <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed"><strong className="text-[#14173F] dark:text-white">Eligibility:</strong> {opp.eligibility}</p>
                <div>
                  <p className="text-xs font-bold text-[#14173F] dark:text-white mb-1">Requirements:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {opp.requires.map((r, i) => <li key={i} className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">{r}</li>)}
                  </ul>
                </div>
              </div>
            </div>
            
            <a href={opp.link} target="_blank" rel="noopener noreferrer" className="w-full block text-center py-2.5 bg-[#5B5BE0] text-white text-sm font-bold rounded-lg hover:bg-[#4B4FC9] transition-colors shadow-sm">
              Apply on Official Site ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}