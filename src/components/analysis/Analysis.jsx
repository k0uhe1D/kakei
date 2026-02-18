import MetricCard from "./MetricCard";
import { CAT_COLORS } from "../../constants/categories";
import { fmt, pct } from "../../utils/format";
import S from "../../styles/shared";

export default function Analysis({ balances, data }) {
  const items = data.items || [];
  const totalMonths = balances.filter(b => b.totalIncome > 0 || b.totalExpense > 0).length || 1;

  // Average
  const avgIncome = balances.reduce((s, b) => s + b.totalIncome, 0) / totalMonths;
  const avgExpense = balances.reduce((s, b) => s + b.totalExpense, 0) / totalMonths;
  const avgSurplus = avgIncome - avgExpense;

  // Savings rate
  const savingsRate = avgIncome > 0 ? pct(avgSurplus, avgIncome) : 0;

  // Expense by category across all months
  const catTotals = {};
  balances.forEach(b => {
    b.expenses.forEach(it => {
      catTotals[it.category] = (catTotals[it.category] || 0) + it.amount;
    });
  });
  const totalExp = Object.values(catTotals).reduce((s, v) => s + v, 0);
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  // Fixed vs variable
  const fixedCats = new Set(["家賃", "光熱費", "通信費", "保険", "ローン"]);
  const fixedTotal = sortedCats.filter(([c]) => fixedCats.has(c)).reduce((s, [, v]) => s + v, 0);
  const variableTotal = totalExp - fixedTotal;

  // Month with worst/best surplus
  const bestMonth = [...balances].sort((a, b) => b.surplus - a.surplus)[0];
  const worstMonth = [...balances].sort((a, b) => a.surplus - b.surplus)[0];

  // One-time items
  const oneTimeItems = items.filter(i => i.recurring === false);
  const oneTimeExpTotal = oneTimeItems.filter(i => i.type === "expense").reduce((s, i) => s + i.amount, 0);
  const oneTimeIncTotal = oneTimeItems.filter(i => i.type === "income").reduce((s, i) => s + i.amount, 0);

  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>収支分析</h2>

      {/* Key metrics */}
      <div className="grid-2">
        <MetricCard label="月平均収入" value={`¥${fmt(avgIncome)}`} sub="12ヶ月平均" color="#22c55e" />
        <MetricCard label="月平均支出" value={`¥${fmt(avgExpense)}`} sub="12ヶ月平均" color="#ef4444" />
        <MetricCard label="月平均余剰" value={`¥${fmt(avgSurplus)}`} sub={avgSurplus >= 0 ? "黒字" : "赤字"} color={avgSurplus >= 0 ? "#3b82f6" : "#ef4444"} />
        <MetricCard label="貯蓄率" value={`${savingsRate}%`} sub="収入に対する余剰割合" color={savingsRate >= 20 ? "#22c55e" : savingsRate >= 10 ? "#eab308" : "#ef4444"} />
      </div>

      {/* Fixed vs Variable */}
      <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>固定費 vs 変動費（12ヶ月合計）</h2>
      <div style={S.fvCard}>
        <div style={S.fvRow}>
          <div style={S.fvLabel}>固定費</div>
          <div style={S.fvBarOuter}>
            <div style={{ ...S.fvBarInner, width: `${pct(fixedTotal, totalExp)}%`, backgroundColor: "#6366f1" }} />
          </div>
          <div style={S.fvVal}>¥{fmt(fixedTotal)} ({pct(fixedTotal, totalExp)}%)</div>
        </div>
        <div style={S.fvRow}>
          <div style={S.fvLabel}>変動費</div>
          <div style={S.fvBarOuter}>
            <div style={{ ...S.fvBarInner, width: `${pct(variableTotal, totalExp)}%`, backgroundColor: "#f59e0b" }} />
          </div>
          <div style={S.fvVal}>¥{fmt(variableTotal)} ({pct(variableTotal, totalExp)}%)</div>
        </div>
        <div style={S.fvNote}>固定費: 家賃・光熱費・通信費・保険・ローン</div>
      </div>

      {/* Category ranking */}
      <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>支出カテゴリ ランキング</h2>
      <div style={S.catBreakdown}>
        {sortedCats.map(([cat, amt], i) => (
          <div key={cat} style={S.catRow}>
            <div style={S.catLeft}>
              <span style={S.rankNum}>#{i + 1}</span>
              <div style={{ ...S.catDot, backgroundColor: CAT_COLORS[cat] || "#94a3b8" }} />
              <span style={S.catName}>{cat}</span>
            </div>
            <div style={S.catRight}>
              <div style={S.catBarOuter}>
                <div style={{ ...S.catBarInner, width: `${pct(amt, totalExp)}%`, backgroundColor: CAT_COLORS[cat] || "#94a3b8" }} />
              </div>
              <span style={S.catAmt}>¥{fmt(amt)}</span>
              <span style={S.catPct}>{pct(amt, totalExp)}%</span>
            </div>
          </div>
        ))}
        {sortedCats.length === 0 && <div style={S.emptySmall}>支出データがありません</div>}
      </div>

      {/* One-time summary */}
      {oneTimeItems.length > 0 && (
        <>
          <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>単発収支のまとめ</h2>
          <div className="grid-2">
            <MetricCard label="単発収入合計" value={`¥${fmt(oneTimeIncTotal)}`} sub={`${oneTimeItems.filter(i => i.type === "income").length}件`} color="#22c55e" />
            <MetricCard label="単発支出合計" value={`¥${fmt(oneTimeExpTotal)}`} sub={`${oneTimeItems.filter(i => i.type === "expense").length}件`} color="#ef4444" />
          </div>
        </>
      )}

      {/* Best / Worst month */}
      <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>ベスト & ワースト月</h2>
      <div className="grid-2">
        <div style={{ ...S.sumCard, borderLeft: "4px solid #22c55e" }}>
          <div style={S.sumLabel}>最も黒字の月</div>
          <div style={{ ...S.sumValue, color: "#22c55e" }}>{bestMonth?.label}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>+¥{fmt(bestMonth?.surplus || 0)}</div>
        </div>
        <div style={{ ...S.sumCard, borderLeft: "4px solid #ef4444" }}>
          <div style={S.sumLabel}>最も赤字の月</div>
          <div style={{ ...S.sumValue, color: "#ef4444" }}>{worstMonth?.label}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>¥{fmt(worstMonth?.surplus || 0)}</div>
        </div>
      </div>

      {/* Budget Accuracy (if actuals exist) */}
      {(() => {
        const monthsWithActuals = balances.filter(b => b.hasActuals);
        if (monthsWithActuals.length === 0) return null;

        const totalBudgetExp = monthsWithActuals.reduce((s, b) => s + b.totalExpense, 0);
        const totalActualExp = monthsWithActuals.reduce((s, b) => s + b.actualExpense, 0);
        const accuracy = totalBudgetExp > 0 ? pct(Math.min(totalActualExp, totalBudgetExp), Math.max(totalActualExp, totalBudgetExp)) : 0;

        return (
          <>
            <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>予算精度</h2>
            <div className="grid-2">
              <MetricCard
                label="予算精度"
                value={`${accuracy}%`}
                sub={`${monthsWithActuals.length}ヶ月の実績データ`}
                color={accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#eab308" : "#ef4444"}
              />
              <MetricCard
                label="支出差異"
                value={`¥${fmt(totalActualExp - totalBudgetExp)}`}
                sub={totalActualExp > totalBudgetExp ? "予算超過" : "予算内"}
                color={totalActualExp > totalBudgetExp ? "#ef4444" : "#22c55e"}
              />
            </div>
          </>
        );
      })()}

      {/* Surplus trend */}
      <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>余剰資金トレンド</h2>
      <div style={S.trendChart}>
        {(() => {
          const maxAbs = Math.max(...balances.map(b => Math.abs(b.surplus)), 1);
          return balances.map(b => {
            const h = Math.max(4, (Math.abs(b.surplus) / maxAbs) * 60);
            return (
              <div key={b.key} style={S.trendCol}>
                <div style={S.trendLabel}>{b.short}</div>
                <div style={{ ...S.trendBar, height: h, backgroundColor: b.surplus >= 0 ? "#3b82f6" : "#ef4444" }} />
                <div style={S.trendVal}>{b.surplus >= 0 ? "+" : ""}{fmt(b.surplus)}</div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
