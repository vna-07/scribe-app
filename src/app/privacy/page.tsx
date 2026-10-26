import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy · SCRIBE",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#E9EBFF] dark:bg-[#0E1130] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#1A1F52] rounded-[28px] p-8 sm:p-12 shadow-xl border border-[#E1E4F7] dark:border-[#2A3070]">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo_symbol.png" alt="SCRIBE" width={36} height={36} style={{ width: "auto", height: "auto" }} className="rounded-lg" />
            <span className="font-extrabold text-lg text-[#14173F] dark:text-white">SCRIBE</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-[#5B5BE0] hover:underline">
            ← Back
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-[#14173F] dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">
          Last updated: 26 October 2026. This policy is designed around South Africa&apos;s Protection of Personal Information Act (POPIA).
        </p>

        <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] rounded-xl p-4 mb-8 border border-[#D99A00]">
          <p className="text-sm font-bold text-[#1D2260] dark:text-[#F2B84B] mb-1">Demo Workspace Notice</p>
          <p className="text-xs text-[#1D2260] dark:text-[#C5C9F5] leading-relaxed">
            The demonstration workspace for &quot;Siyanda&apos;s Spaza&quot; uses historical transaction data provided by the business owner. All customer names, personal identifiers, and specific sensitive items have been anonymised or removed to protect privacy.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
          <section>
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-3">1. What we collect</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-[#14173F] dark:text-white">Account data:</strong> your name, email address, and a securely hashed password.</li>
              <li><strong className="text-[#14173F] dark:text-white">Business profile:</strong> trading name, business type, location and currency.</li>
              <li><strong className="text-[#14173F] dark:text-white">Business records:</strong> transactions, stock movements, receipts, and supplier details you upload or enter.</li>
              <li><strong className="text-[#14173F] dark:text-white">Product usage events:</strong> workflow completions or errors. We do not store your transaction descriptions or amounts in these events.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-3">2. AI processing</h2>
            <p>
              When you interact with Themba (the AI assistant) or upload a document for scanning, we send a summary of your business context and your question/document image to third-party AI providers — currently Google Gemini and Groq. This context may include aggregated figures and recent record descriptions, but never your password or authentication tokens.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-3">3. Security</h2>
            <p>
              We use strong password hashing, HTTP-only session cookies, per-business access controls, and cryptographic signatures (SHA-256 hash chains with Ed25519 signatures) for every record. A valid signature proves a record has <em>not been altered</em> since it was sealed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-3">4. Your rights under POPIA</h2>
            <p>You have the right to access, correct, or request deletion of your personal information. For any privacy request, contact the SCRIBE team at <span className="font-bold text-[#14173F] dark:text-white">privacy@scribe.app</span>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E1E4F7] dark:border-[#2A3070] text-xs text-[#5A5F8C] dark:text-[#C5C9F5]">
          <p>This policy describes the deployed SCRIBE application. If our providers or processing change materially, we will update this page.</p>
        </div>
      </div>
    </main>
  );
}