import type { DataCompleteness } from "@/lib/completeness";

export default function CompletenessCard({ data }: { data: DataCompleteness }) {
  // Determine status based on coverage
  const isHigh = data.coverage_percent >= 80;
  const isMedium = data.coverage_percent >= 50 && data.coverage_percent < 80;
  
  return (
    <div className="bg-white dark:bg-[#1A1F52] rounded-[24px] p-6 border border-[#E1E4F7] dark:border-[#2A3070] shadow-sm mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-extrabold text-[#14173F] dark:text-white text-lg">Data Completeness</h3>
          <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">How much of your activity is backed by evidence?</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          isHigh ? "bg-[#47745D]/10 text-[#47745D]" : 
          isMedium ? "bg-[#FFF0C4] text-[#D99A00]" : 
          "bg-[#A94E40]/10 text-[#A94E40]"
        }`}>
          {isHigh ? "Strong" : isMedium ? "Needs Work" : "Weak"}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-extrabold text-[#14173F] dark:text-white tabular-nums">
          {data.coverage_percent}%
        </span>
        <span className="text-sm font-bold text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">documented</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full bg-[#E1E4F7] dark:bg-[#2A3070] rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full rounded-full transition-all ${
            isHigh ? "bg-[#47745D]" : isMedium ? "bg-[#D99A00]" : "bg-[#A94E40]"
          }`} 
          style={{ width: `${Math.max(3, data.coverage_percent)}%` }} 
        />
      </div>

      <div className="flex justify-between text-xs text-[#4A4F7A] dark:text-[#C5C9F5] mb-4">
        <span>{data.documented_records} with receipts</span>
        <span>{data.missing_evidence_count} missing evidence</span>
      </div>

      {data.missing_evidence_count > 0 && (
        <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 flex gap-3 items-start">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
          </svg>
          <p className="text-xs text-[#14173F] dark:text-white leading-relaxed">
            <strong>Next step:</strong> Attach receipts to {data.missing_evidence_count} records to strengthen your business profile.
          </p>
        </div>
      )}
    </div>
  );
}