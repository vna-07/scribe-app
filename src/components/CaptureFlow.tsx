"use client";

import { useState, useRef } from "react";

export default function CaptureFlow({ businessId, onComplete, onClose }: { businessId: string, onComplete: () => void, onClose: () => void }) {
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload");
  const [image, setImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setStep("processing");

      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        setExtractedData(data);
        setStep("review");
      } catch {
        alert("Failed to read the receipt.");
        setStep("upload");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    setBusy(true);
    try {
      const payload = {
        business_id: businessId,
        kind: "sale",
        amount: extractedData.total,
        description: `Receipt: ${extractedData.merchant} (${extractedData.items.length} items)`,
        occurred_at: new Date(extractedData.date).getTime(),
      };

      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      
      onComplete();
      onClose();
    } catch {
      alert("Failed to save record");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E1130]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] rounded-[28px] p-6 w-full max-w-md shadow-2xl overflow-hidden">
        
        {step === "upload" && (
          <div className="text-center py-12">
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} className="hidden" />
            <div className="w-20 h-20 bg-[#F1F2FF] dark:bg-[#2A3070] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B5BE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Capture Receipt</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-8">Take a photo of your till slip to extract the items.</p>
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md">
              Open Camera
            </button>
            <button onClick={onClose} className="mt-3 text-xs font-bold text-[#5A5F8C] hover:text-[#14173F]">Cancel</button>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-[#A9AEFF] border-t-[#5B5BE0] rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white mb-1">Reading document...</h2>
            <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5]">Extracting totals and items.</p>
          </div>
        )}

        {step === "review" && extractedData && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-extrabold text-[#14173F] dark:text-white">Confirm Data</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A00] bg-[#FFF0C4] dark:bg-[#4A3B10] px-2 py-1 rounded">Needs Review</span>
            </div>
            
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                {image && <img src={image} alt="Receipt" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#5A5F8C] font-bold uppercase mb-1">Merchant</p>
                <input 
                  value={extractedData.merchant} 
                  onChange={(e) => setExtractedData({...extractedData, merchant: e.target.value})}
                  className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-lg px-3 py-2 text-sm font-bold text-[#14173F] dark:text-white mb-2" 
                />
                <p className="text-xs text-[#5A5F8C] font-bold uppercase mb-1">Total Amount (R)</p>
                <input 
                  type="number"
                  value={extractedData.total} 
                  onChange={(e) => setExtractedData({...extractedData, total: parseFloat(e.target.value)})}
                  className="w-full bg-[#F1F2FF] dark:bg-[#2A3070] border border-[#E1E4F7] dark:border-[#3A4080] rounded-lg px-3 py-2 text-sm font-bold text-[#5B5BE0] dark:text-[#A9AEFF]" 
                />
              </div>
            </div>

            <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-3 mb-6 max-h-32 overflow-y-auto">
              <p className="text-[10px] font-bold text-[#5A5F8C] uppercase mb-2">Extracted Items</p>
              {extractedData.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-[#E1E4F7] dark:border-[#3A4080] last:border-0">
                  <span className="text-[#14173F] dark:text-white">{item.quantity}× {item.description}</span>
                  <span className="font-bold text-[#4A4F7A] dark:text-[#C5C9F5]">R{item.amount}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("upload")} className="px-4 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl text-sm">Retake</button>
              <button onClick={handleConfirm} disabled={busy} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors disabled:opacity-50">
                {busy ? "Sealing..." : "Confirm & Seal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}