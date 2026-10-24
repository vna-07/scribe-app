import { notFound } from "next/navigation";
import { loadDemoData } from "@/lib/demo-data";
import { rands, fmtDate } from "@/lib/format";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadDemoData(id);
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-[#f5f0e6] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-[#c9a961] tracking-[0.3em] text-xs mb-2">PUBLIC VERIFICATION</p>
          <h1 className="font-serif text-3xl">{data.businessName}</h1>
          <p className="text-[#a8a093]">{data.businessLocation}</p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            data.chain.ok
              ? "border-green-700 bg-green-950/40"
              : "border-red-700 bg-red-950/40"
          }`}
        >
          <p className="font-medium">
            {data.chain.ok
              ? "✓ Every record verified end-to-end"
              : `✗ Verification failed at record #${data.chain.brokenAtSeq}`}
          </p>
          <p className="text-sm text-[#a8a093] mt-1">
            {data.chain.ok
              ? `${data.chain.total} records are hash-chained and Ed25519-signed. Any change to any record since it was sealed would break this check.`
              : data.chain.reason}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Documented readiness" value={`${data.score.low}–${data.score.high}`} note="Range, not a credit score" />
          <Stat
            label="Stock variance"
            value={data.stock.variance === null ? "No count" : String(data.stock.variance)}
            note={data.stock.variance === null ? "Cannot be computed" : "Review signal"}
          />
        </div>

        <div className="border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#a8a093] mb-2">EVIDENCE MIX</p>
          <div className="text-sm space-y-1">
            <p>Reported only: {countTier(data.recentRecords, "reported")}</p>
            <p>Document-supported: {countTier(data.recentRecords, "document_supported")}</p>
            <p>Counter-signed: {countTier(data.recentRecords, "counter_signed")}</p>
          </div>
        </div>

        <div className="border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#a8a093] mb-2">SCORE COMPONENTS</p>
          <div className="text-sm space-y-2">
            {data.score.components.map((c) => (
              <div key={c.key}>
                <div className="flex justify-between">
                  <span>{c.label}</span>
                  <span className="text-[#a8a093]">{Math.round(c.value * 100)}%</span>
                </div>
                <p className="text-xs text-[#666]">{c.evidence_note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#a8a093] mb-2">RECENT RECORDS</p>
          <div className="text-sm space-y-1">
            {data.recentRecords.map((r) => (
              <p key={r.seq} className="text-[#a8a093]">
                <span className="text-[#c9a961]">#{r.seq}</span> · {fmtDate(r.occurred_at)} ·{" "}
                {r.description}
                {r.amount_cents > 0 && <span> · {rands(r.amount_cents)}</span>}
              </p>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#666] pt-4">
          {data.score.framing} A signature proves a record has not been altered since sealing —
          it does not prove the original sale took place.
        </p>
      </div>
    </main>
  );
}

function countTier(records: { evidence_tier: string }[], tier: string) {
  return records.filter((r) => r.evidence_tier === tier).length;
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-[#333] rounded-xl p-4">
      <p className="text-xs text-[#a8a093]">{label}</p>
      <p className="font-serif text-2xl mt-1">{value}</p>
      <p className="text-xs text-[#666] mt-1">{note}</p>
    </div>
  );
}