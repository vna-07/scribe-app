import type { LedgerRecord } from "./ledger";

export interface DailySales {
  label: string;
  date: string;
  amount: number;
}

export interface ExpenseCategory {
  label: string;
  amount: number;
  color: string;
}

export function generateAnalytics(records: LedgerRecord[]) {
  const sales = records.filter((r) => r.kind === "sale");
  const expenses = records.filter((r) => r.kind === "expense");

  // 1. Group sales by day for the last 14 days
  const dailyMap = new Map<string, number>();
  // Initialize last 14 days with 0
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, 0);
  }

  for (const sale of sales) {
    const dateKey = new Date(sale.occurred_at).toISOString().slice(0, 10);
    if (dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + sale.amount_cents);
    }
  }

  const dailySales: DailySales[] = Array.from(dailyMap.entries()).map(([date, amount]) => {
    const d = new Date(date);
    return {
      date,
      label: d.toLocaleDateString("en-ZA", { weekday: "short" }),
      amount: amount / 100,
    };
  });

  // 2. Group expenses by category (first word of description)
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

  return { dailySales, expenseCategories };
}