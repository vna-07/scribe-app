import type { LedgerRecord } from "./ledger";

export interface DailyData {
  label: string;
  date: string;
  sales: number;
  expenses: number;
  net: number;
}

export interface ExpenseCategory {
  label: string;
  amount: number;
  color: string;
}

export function generateAnalytics(records: LedgerRecord[]) {
  const sales = records.filter((r) => r.kind === "sale");
  const expenses = records.filter((r) => r.kind === "expense");

  // ─── ANCHOR THE CHART TO THE LATEST RECORD ───
  // Siyanda's data ends in the past. If we used today's date,
  // the chart would be empty. So we anchor to the last transaction.
  let maxTime = Date.now();
  if (records.length > 0) {
    maxTime = Math.max(...records.map((r) => r.occurred_at));
  }
  const anchorDate = new Date(maxTime);

  // ─── BUILD A 14-DAY WINDOW ENDING ON THE ANCHOR DATE ───
  const dailyMap = new Map<string, { sales: number; expenses: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { sales: 0, expenses: 0 });
  }

  for (const sale of sales) {
    const dateKey = new Date(sale.occurred_at).toISOString().slice(0, 10);
    if (dailyMap.has(dateKey)) {
      const cur = dailyMap.get(dateKey)!;
      cur.sales += sale.amount_cents;
    }
  }

  for (const exp of expenses) {
    const dateKey = new Date(exp.occurred_at).toISOString().slice(0, 10);
    if (dailyMap.has(dateKey)) {
      const cur = dailyMap.get(dateKey)!;
      cur.expenses += exp.amount_cents;
    }
  }

  const dailyData: DailyData[] = Array.from(dailyMap.entries()).map(([date, data]) => {
    const d = new Date(date);
    return {
      date,
      label: d.toLocaleDateString("en-ZA", { weekday: "short" }),
      sales: data.sales / 100,
      expenses: data.expenses / 100,
      net: (data.sales - data.expenses) / 100,
    };
  });

  // ─── EXPENSE BREAKDOWN ───
  const expenseMap = new Map<string, number>();
  for (const exp of expenses) {
    const category = exp.description.split(" ")[0] || "Other";
    expenseMap.set(category, (expenseMap.get(category) || 0) + exp.amount_cents);
  }

  const colors = ["#5B5BE0", "#A9AEFF", "#14173F", "#D99A00", "#47745D"];
  const expenseCategories: ExpenseCategory[] = Array.from(expenseMap.entries())
    .map(([label, amount], i) => ({
      label,
      amount: amount / 100,
      color: colors[i % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  return { dailyData, expenseCategories };
}