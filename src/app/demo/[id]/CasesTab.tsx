"use client";

import { useState, useEffect } from "react";

interface Case {
  id: string;
  title: string;
  status: string;
  created_at: number;
}

export default function CasesTab({ businessId }: { businessId: string }) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cases?business_id=${businessId}`)
      .then(r => r.json())
      .then(d => { setCases(d); setLoading(false); });
  }, [businessId]);

  if (loading) return <div className="animate-pulse h-32 bg-white/50 dark:bg-[#1A1F52] rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white">Investigations</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Open cases, findings, and missing evidence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cases.map(c => (
          <div key={c.id} className="bg-white dark:bg-[#1A1F52] rounded-xl border border-[#E1E4F7] dark:border-[#2A3070] p-5 shadow-sm hover:border-[#5B5BE0] transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[#14173F] dark:text-white">{c.title}</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                c.status === 'resolved' ? 'bg-[#47745D]/10 text-[#47745D]' :
                c.status === 'requires_attention' ? 'bg-[#B3261E]/10 text-[#B3261E]' :
                c.status === 'investigating' ? 'bg-[#FFF0C4] dark:bg-[#4A3B10] text-[#D99A00]' :
                'bg-[#E1E4F7] dark:bg-[#2A3070] text-[#5A5F8C]'
              }`}>
                {c.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">Opened: {new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}