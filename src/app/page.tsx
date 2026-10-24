import Link from "next/link";
import { findDemoBusinessId } from "@/lib/demo-data";

export default async function Home() {
  const bizId = await findDemoBusinessId();

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-[#f5f0e6] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <p className="text-[#c9a961] tracking-[0.3em] text-xs mb-4">SCRIBE INTELLIGENCE</p>
        <h1 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight">
          Real records.<br />
          <span className="text-[#c9a961]">Greater opportunities.</span>
        </h1>
        <p className="text-[#a8a093] text-lg mb-10 max-w-xl">
          SCRIBE turns a paper cash-book into evidence a lender can trust — and gives every trader
          a first rung on the ladder.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {bizId && (
            <>
              <Link
                href={`/demo/${bizId}`}
                className="bg-[#c9a961] text-[#1a1a1a] font-medium px-6 py-3 rounded-lg hover:bg-[#d4b877] transition text-center"
              >
                Open the live demo →
              </Link>
              <Link
                href={`/verify/${bizId}`}
                className="border border-[#333] px-6 py-3 rounded-lg hover:border-[#c9a961] transition text-center"
              >
                View public verification
              </Link>
            </>
          )}
          {!bizId && (
            <p className="text-[#a8a093] text-sm">
              No demo business yet. Run the seed script first.
            </p>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-[#333] grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-[#c9a961] font-medium mb-1">Tamper-evident</p>
            <p className="text-[#a8a093]">
              Every record is hash-chained and Ed25519-signed. Any edit is caught.
            </p>
          </div>
          <div>
            <p className="text-[#c9a961] font-medium mb-1">Grounded AI</p>
            <p className="text-[#a8a093]">
              Code computes. Themba explains. She never invents numbers.
            </p>
          </div>
          <div>
            <p className="text-[#c9a961] font-medium mb-1">Evidence-aware</p>
            <p className="text-[#a8a093]">
              The score is a range. It says what would improve it, and by how much.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}