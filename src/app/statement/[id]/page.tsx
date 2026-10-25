import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loadDemoData } from "@/lib/demo-data";
import { rands, fmtDate } from "@/lib/format";
import PrintButton from "./PrintButton";
import { generateAnalytics } from "@/lib/analytics";
import { BarChart } from "@/components/Visuals";

export default async function StatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDemoData(id);
  if (!data) notFound();

  const { dailyData } = generateAnalytics(
    data.recentRecords.map(r => ({ ...r, prev_hash: "", canonical_hash: "", signature: "", business_id: data.businessId })) as any
  );

  const generatedAt = new Date().toLocaleString("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const chainOk = data.chain?.ok ?? false;
  const chainTotal = data.chain?.total ?? 0;
  const statementHash = chainOk
    ? `SCRIBE-${data.businessId.slice(0, 8)}-${chainTotal}-${data.recordCount}`
    : "HASH-UNAVAILABLE-CHAIN-BROKEN";

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://scribe-app-xi.vercel.app"}/verify/${data.businessId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=14173F&bgcolor=FFFFFF`;

  const sortedComponents = [...data.score.components].sort((a, b) => b.value - a.value);
  const strongestComponent = sortedComponents[0];
  const weakestComponent = sortedComponents[sortedComponents.length - 1];

  const stockSeverity =
    data.stock.variance === null
      ? "cannot be computed (no count recorded)"
      : data.stock.variance === 0
      ? "reconciled (clean)"
      : `${Math.abs(data.stock.variance)}-unit discrepancy`;

  return (
    <div className="min-h-screen bg-[#E9EBFF] py-12 px-4 sm:px-8 print:bg-white print:p-0 print:m-0">
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-[4px] print:shadow-none print:rounded-none overflow-hidden flex flex-col min-h-[297mm]">
        <header className="bg-[#14173F] text-white px-10 py-8 flex justify-between items-center print:px-12 print:py-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo_symbol.png"
              alt="SCRIBE"
              width={48}
              height={48}
              style={{ width: "auto", height: "auto" }}
              className="rounded-xl bg-white p-1"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">SCRIBE</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#A9AEFF] font-semibold">
                Financial Intelligence
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Financial &amp; Performance Statement</h2>
            <p className="text-xs text-[#C5C9F5] mt-1">
              Statement ID: {statementHash.slice(0, 16)}
            </p>
          </div>
        </header>

        <div className="flex-1 px-10 py-10 print:px-12 print:py-8 space-y-10">
          <section className="grid grid-cols-2 gap-8 border-b border-[#E1E4F7] pb-8">
            <div>
              <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-widest mb-1">
                Business
              </p>
              <h3 className="text-2xl font-extrabold text-[#14173F]">{data.businessName}</h3>
              <p className="text-sm text-[#4A4F7A]">{data.businessLocation}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-widest mb-1">
                Issued
              </p>
              <p className="text-sm font-bold text-[#14173F]">{generatedAt}</p>
              <p className="text-sm text-[#4A4F7A]">Currency: ZAR</p>
              <p className="text-sm text-[#4A4F7A]">
                Status: {chainOk ? "Verified" : "Unverified / Tampered"}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-extrabold text-[#14173F] mb-4">
              1. Executive Financial Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#F1F2FF] rounded-xl p-5 border border-[#E1E4F7]">
                <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-wider mb-1">
                  Recorded Revenue Range
                </p>
                <p className="text-xl font-extrabold text-[#14173F] tabular-nums">
                  {rands(data.revenue.low_cents)} – {rands(data.revenue.high_cents)}
                </p>
                <p className="text-[10px] text-[#5A5F8C] mt-1">Based on {data.revenue.method}</p>
              </div>
              <div className="bg-[#F1F2FF] rounded-xl p-5 border border-[#E1E4F7]">
                <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-wider mb-1">
                  Documented Readiness
                </p>
                <p className="text-xl font-extrabold text-[#14173F] tabular-nums">
                  {data.score.low} – {data.score.high} <span className="text-sm text-[#5A5F8C]">/100</span>
                </p>
                <p className="text-[10px] text-[#5A5F8C] mt-1">
                  Evidence-based range, not a credit score.
                </p>
              </div>
              <div className="bg-[#FFF0C4] rounded-xl p-5 border border-[#E1E4F7]">
                <p className="text-[10px] font-bold text-[#5A5F8C] uppercase tracking-wider mb-1">
                  Stock Variance
                </p>
                <p className="text-xl font-extrabold text-[#14173F] tabular-nums">
                  {data.stock.variance === null ? "No Count" : `${data.stock.variance} units`}
                </p>
                <p className="text-[10px] text-[#5A5F8C] mt-1">{stockSeverity}</p>
              </div>
            </div>
          </section>

          {/* Sales Chart */}
          <section>
            <h3 className="text-lg font-extrabold text-[#14173F] mb-4">Sales Performance (14 Days)</h3>
            <div className="bg-[#F8F9FF] rounded-xl p-6 border border-[#E1E4F7] print:bg-white print:border-[#14173F]">
              <BarChart data={dailyData} height={100} />
            </div>
          </section>

          <section className="bg-[#F8F9FF] rounded-2xl p-6 border border-[#E1E4F7] print:bg-white print:border-[#14173F]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#A9AEFF] text-[#14173F] flex items-center justify-center font-bold text-xs">
                T
              </span>
              <h3 className="text-sm font-extrabold text-[#14173F]">AI-Assisted Analysis (Themba)</h3>
            </div>
            <div className="space-y-3 text-sm text-[#4A4F7A] leading-relaxed">
              <p>
                <strong className="text-[#14173F]">Observation:</strong> The business has recorded{" "}
                {data.recordCount} entries. The strongest component of the readiness score is{" "}
                <strong className="text-[#14173F]">{strongestComponent.label}</strong>, while the
                weakest is <strong className="text-[#14173F]">{weakestComponent.label}</strong>.
              </p>
              {data.stock.variance !== 0 && data.stock.variance !== null && (
                <p>
                  <strong className="text-[#14173F]">Stock Note:</strong> Expected stock was{" "}
                  {data.stock.expected} units but the physical count was {data.stock.counted}. This{" "}
                  {Math.abs(data.stock.variance)}-unit gap requires investigation. Plausible causes
                  include unrecorded sales, unrecorded deliveries, breakage, or a miscount. This
                  statement does not assert misconduct.
                </p>
              )}
              <p>
                <strong className="text-[#14173F]">Recommended Action:</strong>{" "}
                {data.score.counterfactuals[0]?.action || "Maintain consistent recording."}
              </p>
            </div>
            <p className="text-[10px] text-[#5A5F8C] mt-4 italic">
              AI-assisted analysis is distinct from verified financial records. Figures are
              computed by deterministic code; interpretation is provided by Themba.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-extrabold text-[#14173F] mb-4">
              2. Detailed Transaction Ledger
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#14173F] text-[#14173F]">
                  <th className="py-2 px-1 font-bold">Seq</th>
                  <th className="py-2 px-1 font-bold">Date</th>
                  <th className="py-2 px-1 font-bold">Description</th>
                  <th className="py-2 px-1 font-bold text-right">Amount</th>
                  <th className="py-2 px-1 font-bold">Evidence Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4F7]">
                {data.recentRecords.map((r) => (
                  <tr key={r.seq} className="text-[#4A4F7A]">
                    <td className="py-2 px-1 font-mono text-[#5B5BE0]">#{r.seq}</td>
                    <td className="py-2 px-1">{fmtDate(r.occurred_at)}</td>
                    <td className="py-2 px-1 text-[#14173F]">{r.description}</td>
                    <td className="py-2 px-1 text-right font-bold text-[#14173F] tabular-nums">
                      {rands(r.amount_cents)}
                    </td>
                    <td className="py-2 px-1">
                      <span className="bg-[#F1F2FF] text-[#4B4FC9] px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                        {r.evidence_tier.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-[#5A5F8C] mt-2">
              * Showing most recent records for this statement summary. Full data available in
              SCRIBE.
            </p>
          </section>

          <section className="border-t border-[#E1E4F7] pt-8 flex justify-between items-start gap-8">
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-[#14173F] mb-2">
                3. Cryptographic Verification
              </h3>
              <p className="text-xs text-[#4A4F7A] leading-relaxed mb-4">
                This statement is generated from a tamper-evident ledger. Every transaction is
                hash-chained and Ed25519-signed. A signature proves a record has not been altered
                since sealing. It does not prove the underlying transaction occurred.
              </p>
              <div className="bg-[#F1F2FF] rounded-lg p-3 text-[10px] font-mono text-[#5A5F8C] break-all">
                <strong className="text-[#14173F] block mb-1">STATEMENT HASH:</strong>
                {statementHash}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[100px] h-[100px] bg-white border border-[#E1E4F7] p-1 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Verify Statement" className="w-full h-full object-contain" />
              </div>
              <p className="text-[9px] text-[#5A5F8C] text-center mt-2 w-[120px]">
                Scan to verify online
              </p>
            </div>
          </section>
        </div>

        <footer className="bg-[#F8F9FF] px-10 py-4 border-t border-[#E1E4F7] flex justify-between items-center text-[10px] text-[#5A5F8C] print:px-12">
          <p>Generated by SCRIBE Intelligence. Real records. Greater opportunities.</p>
          <p>Page 1 of 1</p>
        </footer>
      </div>

      <div className="max-w-[210mm] mx-auto mt-6 flex justify-between items-center print:hidden">
        <Link
          href={`/demo/${data.businessId}`}
          className="text-sm font-bold text-[#4B4FC9] hover:underline"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex gap-4">
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#14173F] border border-[#E1E4F7] font-bold px-6 py-3 rounded-xl hover:border-[#5B5BE0] transition-colors"
          >
            View Public Verification
          </a>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}