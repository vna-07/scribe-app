"use client";

import { useState, useMemo } from "react";
import { useVoiceRecognition } from "@/lib/useVoiceRecognition";
import { rands } from "@/lib/format";
import type { ProductState } from "@/lib/stock-state";

interface ParsedTransaction {
  description: string;
  amount_cents: number;
  kind: "sale" | "expense";
  quantity?: number;
  unit?: string;
  item?: string;
  confidence: "high" | "medium" | "low";
  ambiguities: string[];
}

function parseTranscript(text: string): ParsedTransaction | null {
  const lower = text.toLowerCase().trim();
  if (lower.length < 3) return null;

  const ambiguities: string[] = [];

  // Detect both buying and selling → multi-transaction, refuse
  const hasBuy = /\b(bought|buy|paid|purchase[ds]?|spent)\b/i.test(lower);
  const hasSell = /\b(sold|sell|earned|receiv(?:ed|e))\b/i.test(lower);
  if (hasBuy && hasSell) {
    return {
      description: text,
      amount_cents: 0,
      kind: "sale",
      confidence: "low",
      ambiguities: [
        "This mentions both buying and selling. Please describe one transaction at a time.",
      ],
    };
  }

  let kind: "sale" | "expense" = "sale";
  if (hasBuy) kind = "expense";
  else if (hasSell) kind = "sale";

  // Find all "X rand" / "R X" amounts
  const amountPattern = /(\d+(?:[.,]\d{1,2})?)\s*(?:rand|r\b|zar)/gi;
  const amounts: number[] = [];
  let match;
  while ((match = amountPattern.exec(lower)) !== null) {
    const value = parseFloat(match[1].replace(",", "."));
    if (!isNaN(value) && value > 0) amounts.push(value);
  }

  if (amounts.length === 0) {
    return {
      description: text,
      amount_cents: 0,
      kind,
      confidence: "low",
      ambiguities: ["No amount found. Include a total, like 'for 240 rand'."],
    };
  }

  // Check for "X rand each/per" — per-unit pricing
  const eachMatch = lower.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:rand|r)\s*(?:each|per\b)/i);
  let total: number;
  let quantityFromEach: number | undefined;
  if (eachMatch) {
    const qtyMatch = lower.match(/(\d+)\s*(?:bottles?|units?|packets?|loaves?|loaf|bags?|cans?|cartons?|crates?|kgs?|litres?|liters?|l\b|pieces?|packs?)/i);
    if (qtyMatch) {
      quantityFromEach = parseInt(qtyMatch[1]);
      const unitPrice = parseFloat(eachMatch[1].replace(",", "."));
      total = quantityFromEach * unitPrice;
    } else {
      total = parseFloat(eachMatch[1].replace(",", "."));
      ambiguities.push("You mentioned a per-unit price but I couldn't find a quantity.");
    }
  } else {
    // Use the LAST amount as the total (usually the final figure)
    total = amounts[amounts.length - 1];
    if (amounts.length > 1) {
      ambiguities.push(
        `I found ${amounts.length} amounts in that sentence. I've used ${total} as the total — please verify below.`
      );
    }
  }

  // Extract quantity + unit + item
  const qtyMatch = lower.match(/(\d+)\s*(bottles?|units?|packets?|loaves?|loaf|bags?|cans?|cartons?|crates?|kgs?|litres?|liters?|l\b|pieces?|packs?)/i);
  let quantity = quantityFromEach;
  let unit: string | undefined;
  let item: string | undefined;

  if (qtyMatch) {
    if (!quantity) quantity = parseInt(qtyMatch[1]);
    unit = qtyMatch[2].replace(/s$/, "");
    const afterQty = text.substring(text.indexOf(qtyMatch[0]) + qtyMatch[0].length);
    const itemMatch = afterQty.match(/\b(?:of\s+(?:the\s+)?)?([a-zA-Z][a-zA-Z\s]{2,30}?)(?:\s+for|\s+at|\s+each|\s+from|$)/);
    if (itemMatch) item = itemMatch[1].trim();
  }

  // Confidence
  let confidence: "high" | "medium" | "low" = "high";
  if (ambiguities.length > 0) confidence = "low";
  else if (amounts.length > 1 || !quantity) confidence = "medium";

  return {
    description: text,
    amount_cents: Math.round(total * 100),
    kind,
    quantity,
    unit,
    item,
    confidence,
    ambiguities,
  };
}

interface VoiceCaptureProps {
  businessId: string;
  products: ProductState[];
  onComplete: () => void;
  onClose: () => void;
}

export default function VoiceCapture({ businessId, products, onComplete, onClose }: VoiceCaptureProps) {
  const [step, setStep] = useState<"record" | "review">("record");
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedKind, setEditedKind] = useState<"sale" | "expense">("sale");
  const [updateStock, setUpdateStock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ id: string; stockUpdated: boolean } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Idempotency key — one per session, prevents duplicate saves
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const { state, transcript, error, isSupported, audioLevel, elapsed, start, stop, reset, retry } =
    useVoiceRecognition({ language: "en-ZA" });

  // Match a product by name for stock-impact preview
  const matchedProduct = useMemo(() => {
    if (!parsed?.item || !parsed?.quantity) return null;
    const search = parsed.item.toLowerCase();
    return products.find((p) => {
      const name = p.name.toLowerCase();
      return name.includes(search) || search.includes(name.split(" ")[0]);
    }) || null;
  }, [parsed, products]);

  const handleReview = () => {
    const result = parseTranscript(transcript);
    if (!result) {
      setParseError("Please say or type a transaction first.");
      return;
    }
    if (result.ambiguities.length > 0 && result.amount_cents === 0) {
      setParseError(result.ambiguities[0]);
      return;
    }
    setParsed(result);
    setEditedAmount((result.amount_cents / 100).toFixed(2));
    setEditedDescription(result.description);
    setEditedKind(result.kind);
    setUpdateStock(result.kind === "expense" && result.quantity !== undefined && matchedProduct !== null);
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
    setParseError(null);

    try {
      // Save the record — idempotency-key prevents duplicates on double-click
      const res = await fetch("/api/records", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
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
      if (!res.ok) throw new Error("Could not save record");
      const json = await res.json();

      // Optionally update stock
      let stockUpdated = false;
      if (updateStock && matchedProduct && parsed?.quantity) {
        const stockRes = await fetch("/api/stock", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "log_movement",
            business_id: businessId,
            product_id: matchedProduct.id,
            type: editedKind === "expense" ? "delivery" : "sale",
            quantity_delta:
              editedKind === "expense" ? Math.abs(parsed.quantity) : -Math.abs(parsed.quantity),
            notes: `Voice capture: ${editedDescription}`,
          }),
        });
        stockUpdated = stockRes.ok;
      }

      setSaved({ id: json.id || "sealed", stockUpdated });
      onComplete();
    } catch {
      setParseError("Could not save the record. Please try again.");
      setSaving(false);
    }
  };

  const handleBack = () => {
    setStep("record");
    setParsed(null);
    setParseError(null);
    setSaved(null);
    retry();
  };

  // ─── SAVED ───
  if (saved) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#47745D]/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#47745D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white mb-2">Record sealed</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#47745D] mb-4">
            Integrity protected
          </p>
          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-2">
              <strong>What was recorded:</strong> trader-reported.
            </p>
            <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
              <strong>What the seal protects:</strong> the record cannot be altered without detection. It does not verify that the underlying transaction occurred.
            </p>
          </div>
          {saved.stockUpdated && matchedProduct && (
            <p className="text-xs text-[#47745D] font-semibold mb-4">
              ✓ Stock updated for {matchedProduct.name}
            </p>
          )}
          <button onClick={onClose} className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl">
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── UNSUPPORTED ───
  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#D99A00]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D99A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white mb-2">Voice isn&apos;t available</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6 leading-relaxed">
            Your browser doesn&apos;t support speech recognition. Try Chrome, Edge, or Safari. You can still record manually using <strong>+ Record Sale</strong> or <strong>− Record Expense</strong>.
          </p>
          <button onClick={onClose} className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl">Close</button>
        </div>
      </div>
    );
  }

  // ─── REVIEW ───
  if (step === "review" && parsed) {
    const hasAmbiguity = parsed.ambiguities.length > 0;
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">Review before saving</h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
              parsed.confidence === "high" ? "bg-[#47745D]/10 text-[#47745D]" :
              parsed.confidence === "medium" ? "bg-[#FFF0C4] text-[#D99A00]" :
              "bg-[#B3261E]/10 text-[#B3261E]"
            }`}>
              {parsed.confidence} confidence
            </span>
          </div>

          {/* Ambiguity banners */}
          {hasAmbiguity && (
            <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] border border-[#D99A00] rounded-xl p-3 mb-4">
              {parsed.ambiguities.map((a, i) => (
                <p key={i} className="text-xs text-[#1D2260] dark:text-[#F2B84B] leading-relaxed">
                  ⚠ {a}
                </p>
              ))}
            </div>
          )}

          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Transcript</p>
            <p className="text-sm text-[#14173F] dark:text-white italic leading-relaxed">&ldquo;{transcript}&rdquo;</p>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Type</label>
              <div className="flex gap-2">
                <button onClick={() => setEditedKind("sale")} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${editedKind === "sale" ? "bg-[#5B5BE0] text-white" : "bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5A5F8C] dark:text-[#C5C9F5]"}`}>Sale</button>
                <button onClick={() => setEditedKind("expense")} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${editedKind === "expense" ? "bg-[#D99A00] text-white" : "bg-[#F1F2FF] dark:bg-[#2A3070] text-[#5A5F8C] dark:text-[#C5C9F5]"}`}>Expense</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Amount (R)</label>
                <input type="number" step="0.01" value={editedAmount} onChange={(e) => setEditedAmount(e.target.value)} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-3 py-2.5 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none tabular-nums" />
              </div>
              {parsed.quantity !== undefined && (
                <div>
                  <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Quantity</label>
                  <input type="number" value={parsed.quantity} onChange={(e) => setParsed({ ...parsed, quantity: parseInt(e.target.value) || undefined })} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-3 py-2.5 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none tabular-nums" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A4F7A] dark:text-[#C5C9F5] mb-1">Description</label>
              <input value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-3 py-2.5 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none" />
            </div>
          </div>

          {/* Stock impact preview */}
          {matchedProduct && parsed.quantity !== undefined && (
            <div className="bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <p className="text-xs font-bold text-[#14173F] dark:text-white">Stock impact detected</p>
              </div>
              <p className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-3">
                This matches <strong>{matchedProduct.name}</strong>. Confirm to {editedKind === "expense" ? "increase" : "decrease"} stock by {parsed.quantity} {parsed.unit || "unit"}{parsed.quantity === 1 ? "" : "s"}.
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={updateStock} onChange={(e) => setUpdateStock(e.target.checked)} className="w-4 h-4 accent-[#5B5BE0]" />
                <span className="text-xs font-bold text-[#14173F] dark:text-white">Also update stock</span>
              </label>
            </div>
          )}

          {parseError && (
            <p className="text-xs text-[#B3261E] dark:text-[#FF8A80] mb-3 font-semibold">{parseError}</p>
          )}

          <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] mb-4 leading-relaxed">
            This is a draft from voice. Nothing is saved until you click below. Voice extraction is best-effort.
          </p>

          <div className="flex gap-2">
            <button onClick={handleBack} disabled={saving} className="px-5 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm disabled:opacity-50">Re-record</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-50 shadow-md">
              {saving ? "Saving…" : "Save record"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RECORD (idle / listening / processing / error) ───
  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white">Speak a transaction</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mt-1">Describe what you sold or bought.</p>
          </div>
          <button onClick={onClose} className="text-[#5A5F8C] hover:text-[#14173F] dark:hover:text-white">✕</button>
        </div>

        {/* States */}
        {state === "requesting_permission" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#5B5BE0] border-t-transparent animate-spin" />
            <p className="text-sm font-bold text-[#14173F] dark:text-white">Requesting microphone access…</p>
            <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mt-2">Please click Allow in your browser.</p>
          </div>
        )}

        {(state === "idle" || state === "listening" || state === "processing") && (
          <>
            <div className="flex flex-col items-center my-6">
              <button
                onClick={state === "listening" ? stop : start}
                disabled={state === "processing"}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  state === "listening"
                    ? "bg-[#B3261E] text-white"
                    : state === "processing"
                    ? "bg-[#5A5F8C] text-white opacity-60"
                    : "bg-[#5B5BE0] text-white hover:scale-105"
                }`}
                aria-label={state === "listening" ? "Stop recording" : "Start recording"}
              >
                {state === "listening" && (
                  <>
                    {[1, 2, 3].map((ring) => (
                      <span
                        key={ring}
                        className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping"
                        style={{ animationDelay: `${ring * 200}ms`, opacity: audioLevel > 20 ? 0.6 : 0.1 }}
                      />
                    ))}
                  </>
                )}
                {state === "listening" ? (
                  <div className="flex items-end gap-1 h-8">
                    {[0.4, 0.7, 1, 0.7, 0.4].map((scale, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-white rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(8, audioLevel * scale)}px` }}
                      />
                    ))}
                  </div>
                ) : state === "processing" ? (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="3" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0" />
                    <line x1="12" y1="18" x2="12" y2="23" />
                  </svg>
                )}
              </button>
              <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] mt-4 uppercase tracking-wider">
                {state === "listening" ? `Listening… ${elapsed}s` : state === "processing" ? "Processing…" : "Tap to speak"}
              </p>
            </div>

            {transcript && (
              <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Live transcript</p>
                <p className="text-sm text-[#14173F] dark:text-white leading-relaxed">{transcript}</p>
              </div>
            )}

            {!transcript && state === "idle" && (
              <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-2">Try saying</p>
                <ul className="space-y-1.5 text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
                  <li>• &ldquo;I sold bread for 90 rand&rdquo;</li>
                  <li>• &ldquo;I bought 12 bottles of cooking oil for 240 rand&rdquo;</li>
                  <li>• &ldquo;Paid 45 rand for transport&rdquo;</li>
                </ul>
              </div>
            )}

            {parseError && (
              <p className="text-xs text-[#B3261E] dark:text-[#FF8A80] mb-3 font-semibold">{parseError}</p>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="px-5 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm">Cancel</button>
              <button
                onClick={handleReview}
                disabled={!transcript || state !== "processing"}
                className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-40 transition-colors shadow-md"
              >
                Review →
              </button>
            </div>
          </>
        )}

        {state === "error" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#B3261E]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm text-[#B3261E] dark:text-[#FF8A80] font-semibold mb-4">{error}</p>
            {transcript && (
              <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 mb-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Captured transcript</p>
                <p className="text-sm text-[#14173F] dark:text-white">{transcript}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm">Close</button>
              <button onClick={retry} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl text-sm">Try again</button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] mt-4 leading-relaxed italic">
          Speech recognition uses your browser&apos;s speech service — Chrome sends audio to Google, Safari to Apple, Edge to Microsoft. SCRIBE does not store the audio. Nothing is saved to your ledger until you confirm.
        </p>
      </div>
    </div>
  );
}