"use client";

import type { DailyData, ExpenseCategory } from "@/lib/analytics";

export function BarChart({ data, height = 220 }: { data: DailyData[]; height?: number }) {
  const barWidth = 100 / data.length;
  // `?? 0` guards: a single missing field would produce NaN and poison the whole chart.
  // Floor of 1 (not 100) — the floor exists only to prevent divide-by-zero on empty
  // datasets; a 100-rand floor would shrink real small-value charts by 100x.
  const maxVal = Math.max(
    ...data.map((x) => Math.max(x.sales ?? 0, x.expenses ?? 0)),
    1,
  );

  // Plot area is 24px shorter than the SVG — that band holds the x-axis labels
  // below. Grid lines AND Y-axis labels both span this same plotHeight region,
  // so they align with each other and with bar tops.
  const plotHeight = height - 24;

  const formatValue = (val: number) => {
    if (val >= 1_000_000) return `R${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `R${(val / 1_000).toFixed(0)}k`;
    return `R${val.toFixed(0)}`;
  };

  return (
    <div className="w-full">
      <div className="flex gap-3">
        {/* Y-axis labels — pt-6 aligns them with the 24px-inset gridlines.
            pb-6 would push them 24px ABOVE their corresponding gridlines. */}
        <div
          className="flex flex-col justify-between text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] font-bold tabular-nums text-right shrink-0 pt-6"
          style={{ height: `${height}px` }}
        >
          <span>{formatValue(maxVal)}</span>
          <span>{formatValue(maxVal * 0.75)}</span>
          <span>{formatValue(maxVal * 0.5)}</span>
          <span>{formatValue(maxVal * 0.25)}</span>
          <span>R0</span>
        </div>

        <div className="flex-1 min-w-0">
          <svg
            viewBox={`0 0 100 ${height}`}
            className="w-full"
            style={{ height: `${height}px` }}
            preserveAspectRatio="none"
          >
            {/* Grid lines — span the plot area, not the full SVG height */}
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1="0"
                y1={height - plotHeight * pct}
                x2="100"
                y2={height - plotHeight * pct}
                stroke="currentColor"
                className="text-[#E1E4F7] dark:text-[#2A3070]"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
            ))}

            {/* Bars — sales (left half) + expenses (right half).
                Colors are hardcoded via Tailwind fill-[...] utilities instead of
                fill="var(--chart-bar)" because var() in the SVG presentation
                attribute doesn't reliably resolve in every toolchain. The
                generated CSS rule `.fill-\[\#5B5BE0\] { fill: #5B5BE0 }` sets the
                fill as a real CSS declaration, which works everywhere. */}
            {data.map((d, i) => {
              const salesH = ((d.sales ?? 0) / maxVal) * plotHeight;
              const expH = ((d.expenses ?? 0) / maxVal) * plotHeight;
              const renderedSalesH = Math.max(2, salesH);
              const renderedExpH = Math.max(2, expH);

              return (
                <g key={d.date}>
                  <rect
                    x={i * barWidth + barWidth * 0.1}
                    y={height - renderedSalesH}
                    width={barWidth * 0.38}
                    height={renderedSalesH}
                    className="fill-[#5B5BE0] dark:fill-[#A9AEFF]"
                    rx={0.5}
                  >
                    <title>{`${d.label}: Sales R${(d.sales ?? 0).toFixed(2)}`}</title>
                  </rect>
                  <rect
                    x={i * barWidth + barWidth * 0.52}
                    y={height - renderedExpH}
                    width={barWidth * 0.38}
                    height={renderedExpH}
                    className="fill-[#D99A00] dark:fill-[#F2B84B] opacity-60"
                    rx={0.5}
                  >
                    <title>{`${d.label}: Expenses R${(d.expenses ?? 0).toFixed(2)}`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>

          {/* X-Axis Labels */}
          <div className="flex justify-between mt-2 text-[10px] text-[#5A5F8C] dark:text-[#C5C9F5] font-bold uppercase">
            {data.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.date}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: ExpenseCategory[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) return <div className="text-sm text-[#5A5F8C] dark:text-[#A9AEFF] transition-colors">No expenses recorded.</div>;

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
          <circle cx="21" cy="21" r="12" fill="var(--background, #FFFFFF)" className="dark:fill-[#14173F]" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-[#5A5F8C] dark:text-[#A9AEFF] uppercase transition-colors">Total</span>
          <span className="text-xs font-extrabold text-[#14173F] dark:text-white transition-colors">R{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {data.slice(0, 3).map((d) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[#4A4F7A] dark:text-[#A9AEFF] font-medium transition-colors">{d.label}</span>
            </div>
            <span className="font-bold text-[#14173F] dark:text-white transition-colors">R{d.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}