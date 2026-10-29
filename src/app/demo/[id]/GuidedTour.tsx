"use client";

import { useState, useEffect } from "react";

export default function GuidedTour() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem("scribe_tour_done");
    if (done) setStep(99); // 99 means hidden
  }, []);

  const handleNext = () => {
    const next = step + 1;
    setStep(next);
    if (next > 4) {
      localStorage.setItem("scribe_tour_done", "true");
    }
  };

  const handleSkip = () => {
    setStep(99);
    localStorage.setItem("scribe_tour_done", "true");
  };

  if (step === 99) return null;

  const steps = [
    { title: "1. The Dashboard", text: "This is Siyanda's Spaza. 21,093 records. Notice the KPI cards show evidence-backed revenue, not fake numbers." },
    { title: "2. The Sidebar", text: "Use the sidebar to navigate. Click 'Investigations' to see open cases and stock variances." },
    { title: "3. Intelligence", text: "The Recommendation Engine found R13,224 trapped in dead stock. Click 'Intelligence' to see it." },
    { title: "4. Trust & Proof", text: "Click 'Share' in the top right to generate a cryptographically signed lender PDF statement." },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-[#1A1F52] border border-[#5B5BE0] rounded-2xl shadow-2xl p-5 animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-[#5B5BE0] uppercase tracking-wider">Guided Tour</span>
        <button onClick={handleSkip} className="text-xs text-[#5A5F8C] hover:text-[#B3261E]">Skip</button>
      </div>
      <h3 className="font-extrabold text-[#14173F] dark:text-white mb-1">{steps[step].title}</h3>
      <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-4 leading-relaxed">
        {steps[step].text}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#5A5F8C]">{step + 1} of 4</span>
        <button onClick={handleNext} className="bg-[#5B5BE0] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#4B4FC9]">
          {step === 3 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}