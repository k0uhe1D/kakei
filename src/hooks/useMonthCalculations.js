import { useMemo } from "react";
import { getMonthLabels, isActiveInMonth } from "../utils/month";

export default function useMonthCalculations(data, actuals = []) {
  const months = useMemo(() => getMonthLabels(), []);

  const balances = useMemo(() => {
    if (!data) return [];

    // Group actuals by month
    const actualsByMonth = {};
    actuals.forEach(a => {
      if (!actualsByMonth[a.monthKey]) actualsByMonth[a.monthKey] = [];
      actualsByMonth[a.monthKey].push(a);
    });

    const summaries = months.map(m => {
      const inc = (data.items || []).filter(it => it.type === "income" && isActiveInMonth(it, m.key));
      const exp = (data.items || []).filter(it => it.type === "expense" && isActiveInMonth(it, m.key));
      const ti = inc.reduce((s, it) => s + it.amount, 0);
      const te = exp.reduce((s, it) => s + it.amount, 0);

      // Actuals for this month
      const monthActuals = actualsByMonth[m.key] || [];
      const actualIncome = monthActuals
        .filter(a => a.type === "income")
        .reduce((s, a) => s + a.amount, 0);
      const actualExpense = monthActuals
        .filter(a => a.type === "expense")
        .reduce((s, a) => s + a.amount, 0);

      const hasActuals = monthActuals.length > 0;

      // Category comparison for budget vs actuals
      const budgetByCategory = {};
      exp.forEach(it => {
        budgetByCategory[it.category] = (budgetByCategory[it.category] || 0) + it.amount;
      });

      const actualByCategory = {};
      monthActuals.filter(a => a.type === "expense").forEach(a => {
        actualByCategory[a.category] = (actualByCategory[a.category] || 0) + a.amount;
      });

      const allCategories = new Set([
        ...Object.keys(budgetByCategory),
        ...Object.keys(actualByCategory),
      ]);

      const categoryComparison = Array.from(allCategories).map(cat => ({
        category: cat,
        budget: budgetByCategory[cat] || 0,
        actual: actualByCategory[cat] || 0,
        variance: (actualByCategory[cat] || 0) - (budgetByCategory[cat] || 0),
      })).sort((a, b) => b.budget - a.budget);

      return {
        ...m,
        incomes: inc,
        expenses: exp,
        totalIncome: ti,
        totalExpense: te,
        surplus: ti - te,
        // Actuals
        actualIncome,
        actualExpense,
        actualSurplus: actualIncome - actualExpense,
        hasActuals,
        actuals: monthActuals,
        // Variance
        incomeVariance: actualIncome - ti,
        expenseVariance: actualExpense - te,
        // Category comparison
        categoryComparison,
      };
    });

    let run = data.balance || 0;
    return summaries.map(s => {
      run += s.surplus;
      return { ...s, cumulativeBalance: run };
    });
  }, [data, months, actuals]);

  return { months, balances };
}
