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

  // ─── SMART ANCHOR: prefer the last SALE, so we always see sales bars ───
  const lastSaleTime = sales.length > 0 ? Math.max(...sales.map((s) => s.occurred_at)) : 0;
  const lastExpenseTime = expenses.length > 0 ? Math.max(...expenses.map((e) => e.occurred_at)) : 0;

  let anchorTime: number;
  if (lastSaleTime > 0 && lastExpenseTime > 0) {
    // If the last expense is within 30 days of the last sale, use the later date
    const gapDays = (lastExpenseTime - lastSaleTime) / (1000 * 60 * 60 * 24);
    anchorTime = Math.abs(gapDays) > 30 ? lastSaleTime : Math.max(lastSaleTime, lastExpenseTime);
  } else {
    anchorTime = lastSaleTime || lastExpenseTime || Date.now();
  }

  const anchorDate = new Date(anchorTime);

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
      label: d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric" }),
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

  const colors = ["#5B5BE0", "#A9AEFF", "#14173F", "#D99A00", "#47745D", "#B89A61"];
  const expenseCategories: ExpenseCategory[] = Array.from(expenseMap.entries())
    .map(([label, amount], i) => ({
      label,
      amount: amount / 100,
      color: colors[i % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  return { dailyData, expenseCategories };
}