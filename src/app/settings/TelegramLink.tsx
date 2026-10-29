"use client";

import { useState } from "react";

export default function TelegramLink() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/generate-link", { method: "POST" });
      const data = await res.json();
      if (data.code) setCode(data.code);
    } catch {
      alert("Failed to generate code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1F52] rounded-2xl p-6 border border-[#E1E4F7] dark:border-[#2A3070]">
      <h3 className="font-extrabold text-[#14173F] dark:text-white mb-2">Telegram Assistant</h3>
      <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-4">
        Link your Telegram account to capture receipts and ask Themba questions without opening the web app.
      </p>

      {!code ? (
        <button onClick={generateCode} disabled={loading} className="bg-[#5B5BE0] text-white px-4 py-2 rounded-lg text-sm font-bold">
          {loading ? "Generating..." : "Generate Linking Code"}
        </button>
      ) : (
        <div className="bg-[#F1F2FF] dark:bg-[#2A3070] p-4 rounded-xl text-center">
          <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Send this command to <strong>@ScribeDemoBot</strong>:</p>
          <p className="text-xl font-mono font-bold text-[#14173F] dark:text-white mt-2">/link {code}</p>
          <p className="text-xs text-[#B3261E] mt-2">Expires in 15 minutes</p>
        </div>
      )}
    </div>
  );
}