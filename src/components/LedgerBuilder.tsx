"use client";

import { useState, useEffect } from "react";

const ALL_COLUMNS = [
  { id: "name", label: "Product Name", locked: true },
  { id: "opening", label: "Opening Stock" },
  { id: "stock_in", label: "Stock In" },
  { id: "stock_sold", label: "Stock Sold" },
  { id: "closing", label: "Closing Stock" },
  { id: "cost", label: "Cost Price" },
  { id: "sell", label: "Selling Price" },
  { id: "unit", label: "Unit (e.g. loaf, packet)" },
];

export default function LedgerBuilder({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("scribe_custom_columns");
    if (saved) {
      setSelected(JSON.parse(saved));
    } else {
      setSelected(["name", "stock_in", "stock_sold", "sell"]); // Default
    }
  }, []);

  const toggle = (id: string) => {
    if (id === "name") return; // Locked
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const save = () => {
    localStorage.setItem("scribe_custom_columns", JSON.stringify(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1130]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1F52] w-full max-w-md rounded-[28px] p-8 shadow-2xl">
        <h2 className="text-2xl font-extrabold text-[#14173F] dark:text-white mb-2">Customize Ledger</h2>
        <p className="text-sm text-[#4A4F7A] dark:text-[#C5C9F5] mb-6">
          Choose the columns that match how your shop operates. SCRIBE will adapt your exported records to match this layout.
        </p>

        <div className="space-y-2 mb-8 max-h-64 overflow-y-auto pr-2">
          {ALL_COLUMNS.map(col => (
            <label key={col.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors cursor-pointer ${
              selected.includes(col.id) ? "border-[#5B5BE0] bg-[#F1F2FF] dark:bg-[#2A3070]" : "border-[#E1E4F7] dark:border-[#3A4080]"
            }`}>
              <input 
                type="checkbox" 
                checked={selected.includes(col.id)} 
                onChange={() => toggle(col.id)}
                disabled={col.locked}
                className="w-4 h-4 accent-[#5B5BE0]"
              />
              <span className="text-sm font-bold text-[#14173F] dark:text-white">{col.label}</span>
              {col.locked && <span className="ml-auto text-[10px] text-[#5A5F8C] uppercase">Required</span>}
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-[#F1F2FF] dark:bg-[#2A3070] text-[#4B4FC9] dark:text-[#A9AEFF] font-bold rounded-xl">Cancel</button>
          <button onClick={save} className="flex-1 py-3 bg-[#5B5BE0] text-white font-bold rounded-xl hover:bg-[#4B4FC9]">Apply Layout</button>
        </div>
      </div>
    </div>
  );
}