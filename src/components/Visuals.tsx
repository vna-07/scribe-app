"use client";

import type { DailySales, ExpenseCategory } from "@/lib/analytics";

export function BarChart({ data, height = 160 }: { data: DailySales[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.amount), 100);
  const barWidth = 100 / data.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto overflow-visible" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1="0" y1={height - height * pct} x2="100" y2={height - height * pct}
            stroke="#E1E4F7" strokeWidth="0.5" strokeDasharray="2 2"
          />
        ))}
        
        {/* Bars */}
        {data.map((d, i) => {
          const h = (d.amount / max) * (height - 20);
          return (
            <g key={d.date}>
              <rect
                x={i * barWidth + barWidth * 0.1}
                y={height - h}
                width={barWidth * 0.8}
                height={h}
                fill="#14173F"
                rx={1}
              />
            </g>
          );
        })}
      </svg>
      
      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2 text-[10px] text-[#5A5F8C] font-bold uppercase">
        {data.filter((_, i) => i % 2 === 0).map((d) => (
          <span key={d.date}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: ExpenseCategory[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) return <div className="text-sm text-[#5A5F8C]">No expenses recorded.</div>;

  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
          {data.map((d) => {
            const pct = d.amount / total;
            const strokeDasharray = `${pct * 100} ${100 - pct * 100}`;
            const strokeDashoffset = 100 - currentAngle;
            currentAngle += pct * 100;
            return (
              <circle
                key={d.label}
                cx="21" cy="21" r="15.915"
                fill="transparent"
                stroke={d.color}
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
          <circle cx="21" cy="21" r="12" fill="#FFFFFF" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-[#5A5F8C] uppercase">Total</span>
          <span className="text-xs font-extrabold text-[#14173F]">R{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {data.slice(0, 3).map((d) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[#4A4F7A] font-medium">{d.label}</span>
            </div>
            <span className="font-bold text-[#14173F]">R{d.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}