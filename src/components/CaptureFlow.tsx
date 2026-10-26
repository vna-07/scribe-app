"use client";

import { useState, useRef, useEffect } from "react";

type Step = "consent" | "upload" | "processing" | "review" | "error";

interface CaptureFlowProps {
  businessId: string;
  onComplete: () => void;
  onClose: () => void;
}

const CONSENT_VERSION = "1.0";

export default function CaptureFlow({ businessId, onComplete, onClose }: CaptureFlowProps) {
  const [step, setStep] = useState<Step>("consent");
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState("Preparing your document…");
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate contextual status messages during processing
  useEffect(() => {
    if (step !== "processing") return;
    const stages = [
      { delay: 0, text: "Preparing your document…" },
      { delay: 500, text: "Sending your document securely…" },
      { delay: 1500, text: "Checking image clarity and readability…" },
      { delay: 2800, text: "Reading your transactions…" },
      { delay: 4800, text: "Identifying dates, items and amounts…" },
      { delay: 7000, text: "Organising your business records…" },
    ];
    const timers = stages.map((s) => setTimeout(() => setStatusMsg(s.text), s.delay));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const acceptConsent = () => {
    if (!consented) return;
    // Record consent (timestamped) — in production this would go to a consent_log table
    const consentRecord = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      business_id: businessId,
    };
    try {
      localStorage.setItem("scribe_consent_" + businessId, JSON.stringify(consentRecord));
    } catch {}
    setStep("upload");
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setStep("processing");
      setStatusMsg("Preparing your document…");

      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        if (!res.ok) {
          throw new Error(`OCR returned ${res.status}`);
        }

        const data = await res.json();

        // Sanity check — the API must return a structured object
        if (!data || !data.items || !Array.isArray(data.items)) {
          throw new Error("Could not read the document structure");
        }

        setExtractedData(data);
        setStatusMsg("Ready for your review.");
        setTimeout(() => setStep("review"), 400);
      } catch (err: any) {
        console.error("[CaptureFlow] OCR failed:", err);
        setErrorMessage("We couldn't finish processing this document. Your original file is still available to retry.");
        setStep("error");
      }
    };
    reader.readAsDataURL(file);
  };

  const retryFromError = () => {
    setStep("upload");
    setImage(null);
    setFileName("");
    setErrorMessage("");
    // Reset input so re-selecting the same file still fires change
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirm = async () => {
    if (!extractedData) return;
    setBusy(true);
    try {
      const occurredAt = extractedData.date
        ? new Date(extractedData.date).getTime()
        : Date.now();

      const payload = {
        business_id: businessId,
        kind: "sale",
        // Convert rands → cents. Guard against NaN (user may have cleared the
        // Total field in the review step, making parseFloat("") → NaN).
        amount_cents: Math.round((Number(extractedData.total) || 0) * 100),
        description: `Receipt: ${extractedData.merchant || "Document"} (${extractedData.items.length} items)`,
        occurred_at: Number.isFinite(occurredAt) ? occurredAt : Date.now(),
      };
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save record");
      onComplete();
      onClose();
    } catch {
      alert("Failed to save record. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // ─── CONSENT STEP ───
  if (step === "consent") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#5B5BE0]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white leading-tight">Before we scan</h2>
              <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mt-0.5">Confirm the records are genuine.</p>
            </div>
          </div>

          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-5">
            <p className="text-sm text-[#14173F] dark:text-white leading-relaxed">
              I confirm that I am authorised to share these records and that, to the best of my knowledge, they are genuine and have not been knowingly misrepresented.
            </p>
            <p className="text-sm text-[#14173F] dark:text-white leading-relaxed mt-3">
              I understand that automated extraction (OCR) may contain errors and that the results may require verification.
            </p>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#E1E4F7] dark:border-[#3A4080] accent-[#5B5BE0] shrink-0"
            />
            <span className="text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
              I agree to the above and to SCRIBE&apos;s processing terms. I understand my documents may be sent to Google Gemini for AI extraction and can be deleted at any time.
            </span>
          </label>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
              Cancel
            </button>
            <button
              onClick={acceptConsent}
              disabled={!consented}
              className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] disabled:opacity-40 transition-colors shadow-md"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── UPLOAD STEP ───
  if (step === "upload") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
          />

          <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-1">Scan a receipt</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">Point the camera at the document and capture it clearly.</p>

          {/* Guidance card */}
          <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-[#14173F] dark:text-white uppercase tracking-widest mb-3">For best results</p>
            <ul className="space-y-1.5 text-xs text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">
              <li className="flex gap-2"><span className="text-[#5B5BE0] font-bold">✓</span> Place the whole document inside the frame</li>
              <li className="flex gap-2"><span className="text-[#5B5BE0] font-bold">✓</span> Hold the camera directly above — no tilt</li>
              <li className="flex gap-2"><span className="text-[#5B5BE0] font-bold">✓</span> Use bright, even lighting — no shadows or glare</li>
              <li className="flex gap-2"><span className="text-[#5B5BE0] font-bold">✓</span> Keep all text, dates and totals visible</li>
              <li className="flex gap-2"><span className="text-[#5B5BE0] font-bold">✓</span> Place on a contrasting, flat surface</li>
            </ul>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Open Camera
          </button>
          <button onClick={onClose} className="w-full mt-3 py-2 text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] hover:text-[#14173F] dark:hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── PROCESSING STEP (The Magic) ───
  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
          <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-1 text-center">Reading your document</h2>
          <p className="text-xs text-[#5A5F8C] dark:text-[#C5C9F5] mb-6 text-center">This usually takes 3–5 seconds.</p>

          {/* Scanner preview */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0E1130] aspect-[3/4] mb-6 shadow-lg">
            {image && (
              <img
                src={image}
                alt="Document being scanned"
                className="absolute inset-0 w-full h-full object-contain opacity-90"
              />
            )}

            {/* Corner brackets */}
            <div className="corner-bracket top-4 left-4 border-t-2 border-l-2 rounded-tl-md" />
            <div className="corner-bracket top-4 right-4 border-t-2 border-r-2 rounded-tr-md" />
            <div className="corner-bracket bottom-4 left-4 border-b-2 border-l-2 rounded-bl-md" />
            <div className="corner-bracket bottom-4 right-4 border-b-2 border-r-2 rounded-br-md" />

            {/* Scanning beam — top animated in globals.css */}
            <div className="scan-beam" />

            {/* Subtle glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#5B5BE0]/15 via-transparent to-[#5B5BE0]/15 pointer-events-none" />
          </div>

          {/* Status message (contextual) */}
          <div className="text-center">
            <p key={statusMsg} className="text-sm font-bold text-[#14173F] dark:text-white animate-fade-in-up">
              {statusMsg}
            </p>
            <div className="mt-4 h-1 bg-[#E1E4F7] dark:bg-[#2A3070] rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-[#5B5BE0] rounded-full progress-indeterminate" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR STEP ───
  if (step === "error") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#B3261E]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#14173F] dark:text-white text-center mb-2">Couldn&apos;t read that document</h2>
          <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] text-center mb-6">{errorMessage}</p>

          {image && (
            <div className="rounded-xl overflow-hidden bg-[#0E1130] aspect-video mb-6">
              <img src={image} alt="Original" className="w-full h-full object-contain opacity-60" />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
              Close
            </button>
            <button
              onClick={retryFromError}
              className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── REVIEW STEP ───
  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">Review extracted data</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A00] bg-[#FFF0C4] dark:bg-[#4A3B10] px-2 py-1 rounded">
            Verify before saving
          </span>
        </div>

        {extractedData && (
          <>
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-24 bg-[#0E1130] rounded-lg overflow-hidden shrink-0">
                {image && <img src={image} alt="Receipt" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase mb-1">Merchant</label>
                <input
                  value={extractedData.merchant || ""}
                  onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                  className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-lg px-3 py-2 text-sm font-bold text-[#14173F] dark:text-white mb-2"
                />
                <label className="block text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase mb-1">Total Amount (R)</label>
                <input
                  type="number"
                  step="0.01"
                  value={extractedData.total || 0}
                  onChange={(e) => setExtractedData({ ...extractedData, total: parseFloat(e.target.value) })}
                  className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-lg px-3 py-2 text-sm font-bold text-[#5B5BE0] dark:text-[#A9AEFF]"
                />
              </div>
            </div>

            <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 mb-6 max-h-40 overflow-y-auto">
              <p className="text-[10px] font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase mb-2">Extracted Items</p>
              {extractedData.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1.5 border-b border-[#E1E4F7] dark:border-[#3A4080] last:border-0">
                  <span className="text-[#14173F] dark:text-white">{item.quantity}× {item.description}</span>
                  <span className="font-bold text-[#4A4F7A] dark:text-[#C5C9F5] tabular-nums">R{item.amount}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] leading-relaxed mb-6">
              AI extraction may contain errors. Correct any values before confirming. Your original document is preserved in the audit trail.
            </p>

            <div className="flex gap-3">
              <button
                onClick={retryFromError}
                className="px-4 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors disabled:opacity-50 shadow-md"
              >
                {busy ? "Sealing record…" : "Confirm & Seal"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}