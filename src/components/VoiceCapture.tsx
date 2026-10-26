"use client";

import { useState } from "react";
import { useVoiceRecognition } from "@/lib/useVoiceRecognition";

interface ParsedTransaction {
  description: string;
  amount_cents: number;
  kind: "sale" | "expense";
}

interface VoiceCaptureProps {
  businessId: string;
  onComplete: () => void;
  onClose: () => void;
}

/**
 * Deterministic parser for simple spoken transactions.
 * Handles patterns like:
 *   "I sold 5 bread for 90 rand"  → sale, R90
 *   "I bought 12 bottles of oil for 240 rand from my supplier" → expense, R240
 *   "Paid 45 rand for transport" → expense, R45
 */
function parseTranscript(text: string): ParsedTransaction | null {
  const lower = text.toLowerCase();

  // Extract amount: "for 240 rand", "240 rand", "R240", "240.50"
  const amountMatch = lower.match(/(?:for|paid|sold|bought|cost)?\s*r?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:rand|r\b|zar)/i);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(",", "."));
  if (isNaN(amount) || amount <= 0) return null;

  // Detect direction
  const isExpense = /(bought|paid|expense|cost|spent|purchased|supplier)/.test(lower);
  const isSale = /(sold|sale|earned|received|income)/.test(lower);

  let kind: "sale" | "expense" = "sale";
  if (isExpense && !isSale) kind = "expense";
  else if (isSale) kind = "sale";

  // Use the original transcript as the description (user can edit)
  return {
    description: text.trim(),
    amount_cents: Math.round(amount * 100),
    kind,
  };
}

export default function VoiceCapture({ businessId, onComplete, onClose }: VoiceCaptureProps) {
  const [step, setStep] = useState<"record" | "review">("record");
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedKind, setEditedKind] = useState<"sale" | "expense">("sale");
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const {
    isListening,
    transcript,
    isSupported,
    error,
    start,
    stop,
    reset,
  } = useVoiceRecognition({
    language: "en-ZA",
    continuous: false,
  });

  const handleReview = () => {
    const result = parseTranscript(transcript);
    if (!result) {
      setParseError(
        "I couldn't find an amount in that. Try saying something like 'I bought 12 bottles of oil for 240 rand' or 'I sold bread for 90 rand'."
      );
      return;
    }
    setParsed(result);
    setEditedAmount((result.amount_cents / 100).toFixed(2));
    setEditedDescription(result.description);
    setEditedKind(result.kind);
    setParseError(null);
    setStep("review");
  };

  const handleSave = async () => {
    const amountCents = Math.round(parseFloat(editedAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setParseError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          kind: editedKind,
          amount_cents: amountCents,
          description: `Voice: ${editedDescription}`,
          occurred_at: Date.now(),
          source_channel: "web",
          evidence_tier: "reported",
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      onComplete();
      onClose();
    } catch {
      setParseError("Could not save the record. Please try again.");
      setSaving(false);
    }
  };

  const handleBack = () => {
    setStep("record");
    reset();
    setParsed(null);
    setParseError(null);
  };

  // ─── Unsupported browser ───
  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#D99A00]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D99A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white mb-2">Voice input isn&apos;t available</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6 leading-relaxed">
            Your browser doesn&apos;t support speech recognition. Try Chrome, Edge, or Safari. You can still record transactions manually.
          </p>
          <button onClick={onClose} className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl">Close</button>
        </div>
      </div>
    );
  }

  // ─── Review step ───
  if (step === "review") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">Review before saving</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A00] bg-[#FFF0C4] dark:bg-[#4A3B10] px-2 py-1 rounded">
              Draft from voice
            </span>
          </div>

          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-2">What I heard</p>
            <p className="text-sm text-[#14173F] dark:text-white italic leading-relaxed">&ldquo;{transcript}&rdquo;</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditedKind("sale")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    editedKind === "sale" ? "bg-[#5B5BE0] text-white" : "bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5A5F8C] dark:text-[#C5C9F5]"
                  }`}
                >
                  Sale
                </button>
                <button
                  onClick={() => setEditedKind("expense")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    editedKind === "expense" ? "bg-[#D99A00] text-white" : "bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5A5F8C] dark:text-[#C5C9F5]"
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Amount (R)</label>
              <input
                type="number"
                step="0.01"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Description</label>
              <input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
              />
            </div>
          </div>

          {parseError && (
            <p className="text-xs text-[#B3261E] dark:text-[#FF8A80] mb-4 font-semibold">{parseError}</p>
          )}

          <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] mb-6 leading-relaxed">
            This is a draft from speech. Nothing is saved until you click Confirm. Voice extraction is best-effort — correct anything that looks wrong.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="px-5 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm"
            >
              Re-record
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50 transition-colors shadow-md"
            >
              {saving ? "Sealing..." : "Confirm & Seal"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Record step ───
  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white">Speak a transaction</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mt-1">
              Describe what you sold or bought. We&apos;ll turn it into a draft.
            </p>
          </div>
          <button onClick={onClose} className="text-[#5A5F8C] hover:text-[#14173F] dark:hover:text-white">
            ✕
          </button>
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center my-8">
          <button
            onClick={isListening ? stop : start}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening
                ? "bg-[#B3261E] text-white animate-pulse"
                : "bg-[#5B5BE0] text-white hover:scale-105"
            }`}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0" />
                <line x1="12" y1="18" x2="12" y2="23" />
              </svg>
            )}
          </button>
          <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] mt-4 uppercase tracking-wider">
            {isListening ? "Listening — speak now" : "Tap to speak"}
          </p>
        </div>

        {/* Live transcript */}
        {transcript && (
          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-4 min-h-[60px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Live transcript</p>
            <p className="text-sm text-[#14173F] dark:text-white leading-relaxed">{transcript}</p>
          </div>
        )}

        {error && (
          <div className="bg-[#B3261E]/10 border border-[#B3261E] rounded-xl p-3 mb-4">
            <p className="text-xs text-[#B3261E] dark:text-[#FF8A80] font-semibold">{error}</p>
          </div>
        )}

        {parseError && (
          <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] border border-[#D99A00] rounded-xl p-3 mb-4">
            <p className="text-xs text-[#1D2260] dark:text-[#F2B84B] leading-relaxed">{parseError}</p>
          </div>
        )}

        {/* Example hints */}
        {!transcript && !isListening && (
          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-2">Try saying</p>
            <ul className="space-y-1.5 text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
              <li className="flex gap-2"><span className="text-[#5B5BE0]">•</span> &ldquo;I sold bread for 90 rand&rdquo;</li>
              <li className="flex gap-2"><span className="text-[#5B5BE0]">•</span> &ldquo;I bought 12 bottles of oil for 240 rand&rdquo;</li>
              <li className="flex gap-2"><span className="text-[#5B5BE0]">•</span> &ldquo;Paid 45 rand for transport&rdquo;</li>
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="px-5 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={handleReview}
            disabled={!transcript || isListening}
            className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-40 transition-colors shadow-md"
          >
            Review transaction →
          </button>
        </div>

        <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] mt-4 leading-relaxed italic">
          Speech recognition is handled by your browser&apos;s speech service (Google, Apple, or Microsoft depending on your browser). Audio is not stored on SCRIBE&apos;s servers. Nothing is saved until you confirm.
        </p>
      </div>
    </div>
  );
}