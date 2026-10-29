"use client";

import { useState } from "react";

export default function TelegramLink() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/generate-link", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      if (data.code) setCode(data.code);
    } catch (err) {
      alert("Failed to generate linking code. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-[#14173F] rounded-[28px] p-8 shadow-sm border border-[#E1E4F7] dark:border-[#2A3070]">
      <div className="mb-2">
        <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">Telegram</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mt-1">
          Link your Telegram account to capture receipts and ask Themba questions straight from your phone.
        </p>
      </div>

      {!code ? (
        <div className="mt-6">
          <button
            onClick={generateCode}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-[#5B5BE0] text-white font-bold text-sm hover:bg-[#3D3DC4] transition-colors disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate linking code"}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-[#F1F2FF] dark:bg-[#2A3070] p-6 text-center">
            <div className="text-xs uppercase tracking-wider text-[#5B5BE0] dark:text-[#A9AEFF] font-bold mb-2">
              Your linking code
            </div>
            <div className="text-4xl font-extrabold tracking-[0.25em] text-[#14173F] dark:text-white font-mono">
              {code}
            </div>
            <div className="mt-2 text-xs text-[#4A4F7A] dark:text-[#C5C9F5]">
              Expires in 15 minutes
            </div>
          </div>

          <ol className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] space-y-1 list-decimal list-inside">
            <li>Open Telegram and message <span className="font-bold text-[#14173F] dark:text-white">@ScribeIntellegenceBot</span></li>
            <li>Send <span className="font-mono font-bold">/link {code}</span></li>
            <li>Come back here — your account is now linked</li>
          </ol>

          <button
            onClick={() => setCode(null)}
            className="px-4 py-2 rounded-xl border-2 border-[#E1E4F7] dark:border-[#2A3070] text-[#4A4F7A] dark:text-[#C5C9F5] font-bold text-sm hover:border-[#A9AEFF] transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </section>
  );
}