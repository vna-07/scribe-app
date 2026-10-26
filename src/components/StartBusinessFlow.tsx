"use client";

import { useState } from "react";
import { rands } from "@/lib/format";

type Stage = "welcome" | "idea" | "stage" | "capital" | "location" | "customer" | "plan";

interface Answers {
  idea: string;
  stage: string;
  capital: string;
  location: string;
  customer: string;
}

export default function StartBusinessFlow({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("welcome");
  const [answers, setAnswers] = useState<Answers>({
    idea: "", stage: "", capital: "", location: "", customer: "",
  });
  const [input, setInput] = useState("");

  const submitIdea = () => {
    if (!input.trim()) return;
    setAnswers({ ...answers, idea: input.trim() });
    setInput("");
    setStage("stage");
  };

  const submitStage = (s: string) => {
    setAnswers({ ...answers, stage: s });
    setStage("capital");
  };

  const submitCapital = (c: string) => {
    setAnswers({ ...answers, capital: c });
    setStage("location");
  };

  const submitLocation = () => {
    if (!input.trim()) return;
    setAnswers({ ...answers, location: input.trim() });
    setInput("");
    setStage("customer");
  };

  const submitCustomer = () => {
    if (!input.trim()) return;
    setAnswers({ ...answers, customer: input.trim() });
    setInput("");
    setStage("plan");
  };

  const generatePlan = () => {
    // Deterministic cost estimate based on capital tier
    const capitalMap: Record<string, number> = {
      "Not yet": 5000,
      "Small amount of my own money": 15000,
      "I have a budget in mind": 35000,
      "I'm not sure what I'll need": 20000,
    };
    const estCapital = capitalMap[answers.capital] || 20000;
    const monthlyCosts = Math.round(estCapital * 0.15);
    const breakEvenMonthly = monthlyCosts * 3;
    const breakEvenUnits = Math.ceil(breakEvenMonthly / 50);

    return { estCapital, monthlyCosts, breakEvenMonthly, breakEvenUnits };
  };

  const plan = generatePlan();

  // ─── WELCOME ───
  if (stage === "welcome") {
    return (
      <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-8 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-xs font-bold text-[#B89A61] uppercase tracking-widest mb-3">Start a Business</p>
          <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-4 leading-tight">
            Every great business starts with an idea. Let&apos;s make yours a plan.
          </h2>
          <div className="space-y-3 text-sm text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed mb-8">
            <p>Have a business idea you&apos;ve been sitting on? A service you could offer? A product you think people need? Or simply the ambition to build something of your own?</p>
            <p>With SCRIBE and Themba, you don&apos;t have to figure everything out alone. Explore your target market, understand your customers, calculate startup costs, assess risks, and discover what it would take to turn your idea into a viable business.</p>
            <p className="text-[#14173F] dark:text-white font-semibold">
              Because starting a business isn&apos;t just a leap of faith. It&apos;s a decision you can prepare for.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStage("idea")}
              className="flex-1 md:flex-none md:px-8 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Start planning with Themba
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </button>
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-[#5A5F8C] dark:text-[#C5C9F5] hover:text-[#14173F] dark:hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Shared assistant bubble styling ───
  const ThembaBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-[#5B5BE0] flex items-center justify-center text-xs font-extrabold text-white shrink-0">T</div>
      <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl rounded-tl-sm p-4 text-sm text-[#14173F] dark:text-white leading-relaxed max-w-lg">
        {children}
      </div>
    </div>
  );

  const UserBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-end mb-4">
      <div className="bg-[#5B5BE0] text-white rounded-xl rounded-tr-sm px-4 py-2 text-sm max-w-md">
        {children}
      </div>
    </div>
  );

  const QuickReply = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white dark:bg-[#14173F] border-2 border-[#E1E4F7] dark:border-[#3A4080] hover:border-[#5B5BE0] dark:hover:border-[#A9AEFF] rounded-xl text-sm font-bold text-[#14173F] dark:text-white transition-colors text-left"
    >
      {label}
    </button>
  );

  const InputBar = ({ onSubmit, placeholder }: { onSubmit: () => void; placeholder: string }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="mt-4 flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl px-4 py-3 text-sm text-[#14173F] dark:text-white focus:border-[#5B5BE0] outline-none"
        autoFocus
      />
      <button type="submit" disabled={!input.trim()} className="px-5 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors disabled:opacity-40">
        →
      </button>
    </form>
  );

  return (
    <div className="bg-white dark:bg-[#1A1F52] rounded-2xl border border-[#E1E4F7] dark:border-[#2A3070] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#47745D] animate-pulse"></div>
          <p className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] uppercase tracking-wider">
            Themba · Business Planning
          </p>
        </div>
        <button onClick={onClose} className="text-xs font-bold text-[#5A5F8C] dark:text-[#C5C9F5] hover:text-[#14173F] dark:hover:text-white">
          Cancel
        </button>
      </div>

      {/* ─── IDEA ─── */}
      {stage === "idea" && (
        <div>
          <ThembaBubble>
            Let&apos;s start with the idea, not the paperwork. What kind of business have you been thinking about? It doesn&apos;t need to be fully figured out yet.
          </ThembaBubble>
          <InputBar onSubmit={submitIdea} placeholder="e.g. A poultry farm, a hair salon, a delivery service..." />
        </div>
      )}

      {/* ─── STAGE ─── */}
      {stage === "stage" && (
        <div>
          <UserBubble>{answers.idea}</UserBubble>
          <ThembaBubble>Good. Where are you right now with this?</ThembaBubble>
          <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-2">
            <QuickReply label="I'm exploring an idea" onClick={() => submitStage("exploring")} />
            <QuickReply label="I want to test whether it can work" onClick={() => submitStage("testing")} />
            <QuickReply label="I'm preparing to launch" onClick={() => submitStage("preparing")} />
            <QuickReply label="I've already started trading" onClick={() => submitStage("trading")} />
          </div>
        </div>
      )}

      {/* ─── CAPITAL ─── */}
      {stage === "capital" && (
        <div>
          <UserBubble>{answers.stage.replace("_", " ")}</UserBubble>
          <ThembaBubble>Do you have startup capital in mind?</ThembaBubble>
          <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-2">
            <QuickReply label="Not yet" onClick={() => submitCapital("Not yet")} />
            <QuickReply label="A small amount of my own money" onClick={() => submitCapital("Small amount of my own money")} />
            <QuickReply label="I have a budget in mind" onClick={() => submitCapital("I have a budget in mind")} />
            <QuickReply label="I'm not sure what I'll need" onClick={() => submitCapital("I'm not sure what I'll need")} />
          </div>
        </div>
      )}

      {/* ─── LOCATION ─── */}
      {stage === "location" && (
        <div>
          <UserBubble>{answers.capital}</UserBubble>
          <ThembaBubble>Where are you planning to operate? Location affects rent, competition, and your customer base.</ThembaBubble>
          <InputBar onSubmit={submitLocation} placeholder="e.g. Khayelitsha, Western Cape" />
        </div>
      )}

      {/* ─── CUSTOMER ─── */}
      {stage === "customer" && (
        <div>
          <UserBubble>{answers.location}</UserBubble>
          <ThembaBubble>Who do you think your main customer will be? Think about who will actually pay for this.</ThembaBubble>
          <InputBar onSubmit={submitCustomer} placeholder="e.g. Commuters, local families, small shops..." />
        </div>
      )}

      {/* ─── PLAN ─── */}
      {stage === "plan" && (
        <div>
          <UserBubble>{answers.customer}</UserBubble>
          <ThembaBubble>
            Perfect. Here&apos;s a starting plan for <strong>{answers.idea}</strong> in <strong>{answers.location}</strong>. This is a first draft — you&apos;ll refine it as you learn more.
          </ThembaBubble>

          {/* Plan output */}
          <div className="ml-11 space-y-4">
            {/* Concept summary */}
            <div className="bg-white dark:bg-[#14173F] border-2 border-[#5B5BE0] rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5B5BE0] dark:text-[#A9AEFF] mb-2">Business Concept</p>
              <p className="text-sm text-[#14173F] dark:text-white leading-relaxed">
                <strong>{answers.idea}</strong> — targeting <strong>{answers.customer}</strong> in <strong>{answers.location}</strong>.
              </p>
            </div>

            {/* Financial estimate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Estimated Capital</p>
                <p className="text-xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(plan.estCapital * 100)}</p>
              </div>
              <div className="bg-[#F1F2FF] dark:bg-[#2A3070] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-1">Monthly Costs</p>
                <p className="text-xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(plan.monthlyCosts * 100)}</p>
              </div>
              <div className="bg-[#FFF0C4] dark:bg-[#4A3B10] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D99A00] dark:text-[#F2B84B] mb-1">Break-even Target</p>
                <p className="text-xl font-extrabold text-[#14173F] dark:text-white tabular-nums">{rands(plan.breakEvenMonthly * 100)}<span className="text-xs font-medium text-[#5A5F8C]">/mo</span></p>
              </div>
            </div>

            {/* 90-day roadmap */}
            <div className="bg-white dark:bg-[#14173F] border border-[#E1E4F7] dark:border-[#3A4080] rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5F8C] dark:text-[#C5C9F5] mb-3">90-Day Roadmap</p>
              <div className="space-y-3">
                {[
                  { phase: "Days 1–30", action: `Interview 10 potential ${answers.customer.toLowerCase() || "customers"}. Validate that they would actually pay.` },
                  { phase: "Days 31–60", action: `Test the smallest version of ${answers.idea}. One product, one weekend, one location.` },
                  { phase: "Days 61–90", action: `If demand is confirmed, invest in the first batch of stock/equipment. Start recording every transaction in SCRIBE.` },
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[10px] font-extrabold text-[#5B5BE0] dark:text-[#A9AEFF] bg-[#F1F2FF] dark:bg-[#2A3070] px-2 py-0.5 rounded shrink-0 h-fit tabular-nums">{step.phase}</span>
                    <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] leading-relaxed">{step.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] italic leading-relaxed">
              This is a first-draft estimate based on your answers, not a prediction of success. Actual costs vary by location, supplier, and scale. Validate with real quotes before committing capital.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Save as a goal
                  fetch("/api/goals", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      action: "create_goal",
                      business_id: window.location.pathname.split("/").pop(),
                      title: `Launch: ${answers.idea}`,
                      description: `90-day roadmap. Est. capital: ${rands(plan.estCapital * 100)}. Break-even target: ${rands(plan.breakEvenMonthly * 100)}/mo.`,
                      target_value: plan.breakEvenMonthly,
                    }),
                  }).then(() => onClose());
                }}
                className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9] transition-colors shadow-md"
              >
                Save Plan to Growth Studio
              </button>
              <button onClick={onClose} className="px-5 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}