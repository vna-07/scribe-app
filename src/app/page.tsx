import Link from "next/link";
import { findDemoBusinessId } from "@/lib/demo-data";

export default async function Home() {
  const bizId = await findDemoBusinessId();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Brand / Header */}
        <div className="mb-12 border-b border-[#20221F]/10 pb-6">
          <p className="text-[#B89A61] tracking-[0.2em] text-xs font-semibold mb-2">
            SCRIBE · FINANCIAL INTELLIGENCE
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-[#20221F] leading-tight">
            Your business, <br />
            <span className="text-[#B89A61] italic">understood.</span>
          </h1>
        </div>

        <p className="text-[#20221F]/70 text-lg mb-12 max-w-xl">
          SCRIBE turns a paper cash-book into evidence a lender can trust. A quiet, precise financial instrument for real South African businesses.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          {bizId && (
            <>
              <Link
                href={`/demo/${bizId}`}
                className="bg-[#20221F] text-[#F5F1E8] font-medium px-8 py-3.5 rounded-md hover:bg-[#3a3d38] transition-colors text-center"
              >
                Open the live demo
              </Link>
              <Link
                href={`/verify/${bizId}`}
                className="border border-[#20221F]/20 text-[#20221F] px-8 py-3.5 rounded-md hover:border-[#B89A61] hover:text-[#B89A61] transition-colors text-center font-medium"
              >
                Public verification
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-3 gap-8 border-t border-[#20221F]/10 pt-8">
          <div>
            <h3 className="font-serif text-xl mb-2">Tamper-evident</h3>
            <p className="text-sm text-[#20221F]/60 leading-relaxed">
              Every record is hash-chained and cryptographically signed. Any edit is caught instantly.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-2">Forensic records</h3>
            <p className="text-sm text-[#20221F]/60 leading-relaxed">
              Click any figure to trace it back to the original evidence. Transparency is the default.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-2">Grounded intelligence</h3>
            <p className="text-sm text-[#20221F]/60 leading-relaxed">
              Code computes the numbers. Themba explains them. She never guesses.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}