import { notFound } from "next/navigation";
import { loadDemoData } from "@/lib/demo-data";
import { rands, fmtDate } from "@/lib/format";

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadDemoData(id);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[#F5F1E8] text-[#20221F] p-6 sm:p-12 flex justify-center">
      <div className="max-w-2xl w-full space-y-8 bg-[#FFFFFF] border border-[#20221F]/10 p-8 sm:p-12 rounded-2xl shadow-sm h-fit">
        
        {/* Header */}
        <div className="border-b border-[#20221F]/10 pb-6">
          <p className="text-[#B89A61] tracking-[0.2em] text-xs font-semibold mb-2">PUBLIC VERIFICATION</p>
          <h1 className="font-serif text-3xl mb-1">{data.businessName}</h1>
          <p className="text-[#20221F]/60">{data.businessLocation}</p>
        </div>

        {/* Verification Status */}
        <div className={`rounded-xl border p-5 ${
          data.chain.ok 
            ? "border-[#47745D]/30 bg-[#47745D]/5" 
            : "border-[#A94E40]/30 bg-[#A94E40]/5"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${data.chain.ok ? "text-[#47745D]" : "text-[#A94E40]"}`}>
              {data.chain.ok ? "✓" : "✗"}
            </span>
            <p className={`font-semibold ${data.chain.ok ? "text-[#47745D]" : "text-[#A94E40]"}`}>
              {data.chain.ok ? "Every record verified end-to-end" : `Verification failed at record #${data.chain.brokenAtSeq}`}
            </p>
          </div>
          <p className="text-sm text-[#20221F]/60 leading-relaxed">
            {data.chain.ok
              ? `${data.chain.total} records are hash-chained and cryptographically signed. Any change to any record since it was sealed would break this check.`
              : data.chain.reason}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#20221F]/10 rounded-xl p-4 bg-[#F5F1E8]">
            <p className="text-xs text-[#20221F]/50 mb-1 font-medium">Documented readiness</p>
            <p className="font-serif text-2xl">{data.score.low}–{data.score.high}</p>
            <p className="text-[10px] text-[#20221F]/40 mt-1">Range, not a credit score</p>
          </div>
          <div className="border border-[#20221F]/10 rounded-xl p-4 bg-[#F5F1E8]">
            <p className="text-xs text-[#20221F]/50 mb-1 font-medium">Stock variance</p>
            <p className={`font-serif text-2xl ${data.stock.variance !== 0 ? "text-[#A94E40]" : ""}`}>
              {data.stock.variance === null ? "No count" : `${data.stock.variance} units`}
            </p>
            <p className="text-[10px] text-[#20221F]/40 mt-1">Review signal</p>
          </div>
        </div>

        {/* Evidence Mix */}
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#20221F]/40 uppercase mb-3">Evidence mix</p>
          <div className="flex gap-4 text-sm text-[#20221F]/70">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#20221F]/20"></span> Reported only: {data.recentRecords.filter(r => r.evidence_tier === "reported").length}</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#B89A61]"></span> Document-supported: {data.recentRecords.filter(r => r.evidence_tier === "document_supported").length}</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#47745D]"></span> Counter-signed: {data.recentRecords.filter(r => r.evidence_tier === "counter_signed").length}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#20221F]/10 pt-6">
          <p className="text-xs text-[#20221F]/40 leading-relaxed">
            {data.score.framing} A signature proves a record has not been altered since sealing — it does not prove the original sale took place.
          </p>
        </div>

      </div>
    </main>
  );
}