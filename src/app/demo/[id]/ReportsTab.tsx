"use client";

import Link from "next/link";
import { useState } from "react";

export default function ReportsTab({ businessId, data }: { businessId: string, data: any }) {
  const [downloading, setDownloading] = useState(false);

  const handleCSV = () => {
    setDownloading(true);
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Description,Type,Amount,Evidence\n" +
      data.recentRecords.map((r: any) => `${new Date(r.occurred_at).toISOString().slice(0,10)},"${r.description}",${r.kind},${r.amount_cents/100},${r.evidence_tier}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "SCRIBE_Transactions.csv");
    document.body.appendChild(link);
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Reports & Exports</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Generate shareable financial documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Statement */}
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Financial Statement</h3>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-4">A4 printable document with cryptographic verification QR code.</p>
          </div>
          <Link href={`/statement/${businessId}`} className="w-full block text-center py-2.5 bg-[#5B5BE0] text-white text-sm font-bold rounded-lg hover:bg-[#4B4FC9] transition-colors">
            Generate PDF
          </Link>
        </div>

        {/* CSV Export */}
        <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">Transaction Ledger (CSV)</h3>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-4">Raw structured data for your accountant or Excel.</p>
          </div>
          <button onClick={handleCSV} disabled={downloading} className="w-full py-2.5 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5B5BE0] dark:text-[#A9AEFF] text-sm font-bold rounded-lg hover:bg-[#E1E4F7] dark:hover:bg-[#3A4080] transition-colors">
            {downloading ? "Downloading..." : "Download CSV"}
          </button>
        </div>
      </div>

      {/* Report History (Mocked for UI completeness) */}
      <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6">
        <h3 className="font-extrabold text-[#14173F] dark:text-white mb-4">Recently Generated</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-[#E1E4F7] dark:border-[#2A3070] last:border-0">
            <div>
              <p className="font-bold text-sm text-[#14173F] dark:text-white">Financial Statement · Oct 2026</p>
              <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5]">Generated {new Date().toLocaleDateString('en-ZA')}</p>
            </div>
            <Link href={`/statement/${businessId}`} className="text-xs font-bold text-[#5B5BE0] hover:underline">View</Link>
          </div>
        </div>
      </div>
    </div>
  );
}