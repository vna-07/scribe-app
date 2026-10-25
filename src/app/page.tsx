import Link from "next/link";
import { findDemoBusinessId } from "@/lib/demo-data";
import Image from "next/image";

export default async function Home() {
  const bizId = await findDemoBusinessId();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#E9EBFF]">
      <div className="max-w-3xl w-full bg-white rounded-[40px] p-10 sm:p-16 shadow-2xl border border-white/50">
        
        <div className="flex items-center gap-4 mb-12">
          <Image 
            src="/logo_symbol.png" 
            alt="SCRIBE Logo" 
            width={56} 
            height={56} 
            style={{ width: 'auto', height: 'auto' }}
            className="rounded-2xl shadow-sm" 
          />
          <div>
            <h1 className="text-2xl font-extrabold text-[#14173F] tracking-wide">SCRIBE</h1>
            <p className="text-xs text-[#5A5F8C] font-semibold tracking-widest uppercase">Financial Intelligence</p>
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-[#14173F] leading-[1.1] mb-6 tracking-tight">
          Your business, <br />
          <span className="text-[#5B5BE0]">understood.</span>
        </h1>

        <p className="text-[#4A4F7A] text-lg mb-12 max-w-xl leading-relaxed">
          SCRIBE turns fragmented records into financial intelligence—what the evidence supports, what doesn't reconcile, and what to do next.
        </p>

        <div className="mb-16">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/signup"
              className="bg-[#5B5BE0] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#4B4FC9] transition-colors text-center shadow-lg shadow-[#5B5BE0]/20"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="bg-white text-[#14173F] border-2 border-[#E1E4F7] px-8 py-4 rounded-2xl hover:border-[#5B5BE0] transition-colors text-center font-bold"
            >
              Sign in
            </Link>
          </div>
          
          {bizId && (
            <p className="text-sm text-[#5A5F8C] text-center sm:text-left">
              Judge?{" "}
              <Link href={`/demo/${bizId}`} className="text-[#5B5BE0] font-bold hover:underline">
                Skip to the demo dashboard →
              </Link>
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-8 border-t border-[#E1E4F7] pt-8">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#A9AEFF]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3 className="font-bold text-[#14173F] mb-2">Tamper-evident</h3>
            <p className="text-sm text-[#4A4F7A] leading-relaxed">
              Every record is hash-chained and Ed25519-signed. Any edit is caught.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#A9AEFF]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3 className="font-bold text-[#14173F] mb-2">Forensic records</h3>
            <p className="text-sm text-[#4A4F7A] leading-relaxed">
              Click any figure to trace it back to the original evidence.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#A9AEFF]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 className="font-bold text-[#14173F] mb-2">Grounded AI</h3>
            <p className="text-sm text-[#4A4F7A] leading-relaxed">
              Code computes the numbers. Themba explains them.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}