"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-[#14173F] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2A3070] transition-colors shadow-md"
    >
      Download PDF / Print
    </button>
  );
}