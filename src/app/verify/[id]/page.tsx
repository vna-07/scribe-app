import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loadDemoData } from "@/lib/demo-data";
import { rands } from "@/lib/format";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDemoData(id);
  if (!data) notFound();

  const chainOk = data.chain?.ok ?? false;
  const statementHash = chainOk
    ? `SCRIBE-${data.businessId.slice(0, 8)}-${data.chain.total}`
    : "HASH-UNAVAILABLE";

  return (
    <main className="min-h-screen bg-[#E9EBFF] py-12 px-4 sm:px-8 flex justify-center font-sans">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/logo_symbol.png" alt="SCRIBE" width={40} height={40} style={{ width: 'auto', height: 'auto' }} className="rounded-xl shadow-sm" />
            <div>
              <h1 className="font-extrabold text-xl text-[#14173F]">SCRIBE</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#5A5F8C] font-bold">Public Verification</p>
            </div>
          </div>
          <Link href="/" className="text-sm font-bold text-[#5B5BE0] hover:underline">
            What is this? →
          </Link>
        </div>

        {/* Main Trust Card */}
        <div className="bg-white rounded-[28px] p-8 shadow-xl border border-white/50">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#47745D]/10 mb-4">
              {chainOk ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#47745D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A94E40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-[#14173F]">
              {chainOk ? "Cryptographically Verified" : "Verification Failed"}
            </h2>
            <p className="text-sm text-[#4A4F7A] mt-2 max-w-md mx-auto leading-relaxed">
              {chainOk 
                ? "This statement is generated from a tamper-evident ledger. Every record has been validated against its cryptographic signature."
                : "This ledger has been modified. The cryptographic chain is broken, and these figures cannot be trusted."}
            </p>
          </div>

          <div className="bg-[#F1F2FF] rounded-2xl p-6 mb-8 border border-[#E1E4F7]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-widest mb-1">Business</p>
                <p className="font-extrabold text-[#14173F]">{data.businessName}</p>
                <p className="text-xs text-[#4A4F7A]">{data.businessLocation}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-widest mb-1">Document Hash</p>
                <p className="text-xs font-mono text-[#14173F] break-all">{statementHash}</p>
              </div>
            </div>
          </div>

          {/* Evidence Breakdown */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-[#5A5F8C] uppercase tracking-widest border-b border-[#E1E4F7] pb-2">Evidence Summary</h3>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#4A4F7A] font-medium">Records Sealed</span>
              <span className="font-bold text-[#14173F]">{data.chain.total}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#4A4F7A] font-medium">Documented Readiness</span>
              <span className="font-bold text-[#14173F]">{data.score.low} – {data.score.high} / 100</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#4A4F7A] font-medium">Open Discrepancies</span>
              <span className={`font-bold ${data.stockState.open_variances === 0 ? "text-[#47745D]" : "text-[#D99A00]"}`}>
                {data.stockState.open_variances === 0
                  ? "None"
                  : `${data.stockState.open_variances} product${data.stockState.open_variances === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-[#FFF0C4] rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-[#D99A00] uppercase tracking-widest">What this proves</p>
            <p className="text-xs text-[#1D2260] leading-relaxed">
              Every record has been <strong>hash-chained and digitally signed</strong>. If any record was altered after it was sealed, verification would fail. The chain reflects exactly what was written.
            </p>
            <p className="text-[10px] font-bold text-[#D99A00] uppercase tracking-widest pt-2">What this does NOT prove</p>
            <p className="text-xs text-[#1D2260] leading-relaxed">
              A signature confirms the record has not been changed since sealing. It does not confirm that the underlying transaction occurred, that a receipt is authentic, or that automated extraction read the document correctly. Those require external corroboration — supplier invoices, counter-signatures, or bank verification.
            </p>
            <p className="text-xs text-[#5A5F8C] italic pt-2">
              SCRIBE does not approve credit. It makes a trader assessable.
            </p>
          </div>
          
        </div>

        {/* Back to App (for the demo) */}
        <div className="text-center print:hidden">
          <Link href={`/demo/${data.businessId}`} className="text-sm font-bold text-[#5B5BE0] hover:underline">
            ← Return to Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}