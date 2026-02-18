import SumCard from "./SumCard";
import BudgetVsActualCard from "./BudgetVsActualCard";
import { CAT_COLORS } from "../../constants/categories";
import { fmt, pct } from "../../utils/format";
import S from "../../styles/shared";

export default function Dashboard({ balances, data, onViewMonth }) {
  const cur = balances[0];
  if (!cur) return null;
  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>今月のサマリー</h2>
      <div className="grid-3">
        <SumCard label="収入合計" value={cur.totalIncome} c="#22c55e" />
        <SumCard label="支出合計" value={cur.totalExpense} c="#ef4444" />
        <SumCard label="余剰資金" value={cur.surplus} c={cur.surplus >= 0 ? "#3b82f6" : "#ef4444"} />
      </div>

      {/* Budget vs Actual Card */}
      <BudgetVsActualCard balance={cur} />

      <div style={{ ...S.flexBetween, marginTop: 28 }}>
        <h2 style={{ ...S.sectionTitle, margin: 0 }}>6ヶ月予測</h2>
      </div>
      <div style={S.miniChart}>
        {balances.slice(0, 6).map(b => {
          const maxSurp = Math.max(...balances.slice(0, 6).map(x => Math.abs(x.surplus)), 1);
          const h = Math.max(6, (Math.abs(b.surplus) / maxSurp) * 70);
          return (
            <div key={b.key} style={S.miniCol} onClick={() => onViewMonth(b.key)}>
              <div style={S.miniLabel}>{b.short}</div>
              <div style={{ ...S.miniBar, height: h, backgroundColor: b.surplus >= 0 ? "#3b82f6" : "#ef4444" }} />
              <div style={S.miniVal}>{b.surplus >= 0 ? "+" : ""}{fmt(b.surplus)}</div>
            </div>
          );
        })}
      </div>

      {/* Quick category breakdown */}
      {cur.totalExpense > 0 && (
        <>
          <h2 style={{ ...S.sectionTitle, marginTop: 28 }}>今月の支出内訳</h2>
          <div style={S.catBreakdown}>
            {Object.entries(cur.expenses.reduce((acc, it) => { acc[it.category] = (acc[it.category] || 0) + it.amount; return acc; }, {}))
              .sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat} style={S.catRow}>
                  <div style={S.catLeft}>
                    <div style={{ ...S.catDot, backgroundColor: CAT_COLORS[cat] || "#94a3b8" }} />
                    <span style={S.catName}>{cat}</span>
                  </div>
                  <div style={S.catRight}>
                    <div style={S.catBarOuter}>
                      <div style={{ ...S.catBarInner, width: `${pct(amt, cur.totalExpense)}%`, backgroundColor: CAT_COLORS[cat] || "#94a3b8" }} />
                    </div>
                    <span style={S.catAmt}>¥{fmt(amt)}</span>
                    <span style={S.catPct}>{pct(amt, cur.totalExpense)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {data.items.length === 0 && <div style={S.emptyMsg}>「＋ 収支を追加」から毎月の収入・支出を登録してください</div>}
    </div>
  );
}
