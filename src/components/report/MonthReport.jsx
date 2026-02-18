import ItemRow from "../items/ItemRow";
import BudgetVsActualChart from "../actuals/BudgetVsActualChart";
import BudgetVsActualTable from "../actuals/BudgetVsActualTable";
import { CAT_COLORS } from "../../constants/categories";
import { fmt, pct } from "../../utils/format";
import S from "../../styles/shared";

export default function MonthReport({ balances, monthKey, onChangeMonth, months, onEdit, onDelete }) {
  const b = balances.find(x => x.key === monthKey) || balances[0];
  if (!b) return null;

  const expByCat = {};
  b.expenses.forEach(it => { expByCat[it.category] = (expByCat[it.category] || 0) + it.amount; });
  const sortedExp = Object.entries(expByCat).sort((a, bb) => bb[1] - a[1]);

  const incByCat = {};
  b.incomes.forEach(it => { incByCat[it.category] = (incByCat[it.category] || 0) + it.amount; });
  const sortedInc = Object.entries(incByCat).sort((a, bb) => bb[1] - a[1]);

  // Compare with prev month
  const curIdx = balances.findIndex(x => x.key === monthKey);
  const prev = curIdx > 0 ? balances[curIdx - 1] : null;
  const expDiff = prev ? b.totalExpense - prev.totalExpense : null;
  const incDiff = prev ? b.totalIncome - prev.totalIncome : null;

  return (
    <div style={S.section}>
      <div style={S.reportNav}>
        <select style={S.reportSelect} value={monthKey} onChange={e => onChangeMonth(e.target.value)}>
          {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      <h2 style={S.sectionTitle}>{b.label} 月次レポート</h2>

      {/* Summary cards */}
      <div className="grid-3">
        <div style={S.sumCard}>
          <div style={S.sumLabel}>収入</div>
          <div style={{ ...S.sumValue, color: "#22c55e" }}>¥{fmt(b.totalIncome)}</div>
          {incDiff !== null && <div style={{ fontSize: 10, color: incDiff >= 0 ? "#22c55e" : "#ef4444", marginTop: 2 }}>
            前月比 {incDiff >= 0 ? "+" : ""}{fmt(incDiff)}
          </div>}
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>支出</div>
          <div style={{ ...S.sumValue, color: "#ef4444" }}>¥{fmt(b.totalExpense)}</div>
          {expDiff !== null && <div style={{ fontSize: 10, color: expDiff <= 0 ? "#22c55e" : "#ef4444", marginTop: 2 }}>
            前月比 {expDiff >= 0 ? "+" : ""}{fmt(expDiff)}
          </div>}
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>余剰</div>
          <div style={{ ...S.sumValue, color: b.surplus >= 0 ? "#3b82f6" : "#ef4444" }}>¥{fmt(b.surplus)}</div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>残高: ¥{fmt(b.cumulativeBalance)}</div>
        </div>
      </div>

      {/* Actuals summary - show when actual data exists */}
      {b.hasActuals && (
        <div style={actualSummaryStyles.wrap}>
          <h3 style={S.sectionTitle}>実績サマリー</h3>
          <div className="grid-3">
            <div style={S.sumCard}>
              <div style={S.sumLabel}>実績収入</div>
              <div style={{ ...S.sumValue, color: "#22c55e" }}>¥{fmt(b.actualIncome)}</div>
            </div>
            <div style={S.sumCard}>
              <div style={S.sumLabel}>実績支出</div>
              <div style={{ ...S.sumValue, color: "#ef4444" }}>¥{fmt(b.actualExpense)}</div>
            </div>
            <div style={S.sumCard}>
              <div style={S.sumLabel}>実績余剰</div>
              <div style={{ ...S.sumValue, color: b.actualSurplus >= 0 ? "#3b82f6" : "#ef4444" }}>
                ¥{fmt(b.actualSurplus)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget vs Actual comparison */}
      {b.hasActuals && b.categoryComparison.length > 0 && (
        <>
          <BudgetVsActualChart categoryComparison={b.categoryComparison} />
          <BudgetVsActualTable categoryComparison={b.categoryComparison} />
        </>
      )}

      {/* Expense breakdown */}
      <h2 style={{ ...S.sectionTitle, marginTop: 24 }}>支出内訳（予算）</h2>
      {sortedExp.length === 0 && <div style={S.emptySmall}>支出なし</div>}
      <div style={S.catBreakdown}>
        {sortedExp.map(([cat, amt]) => (
          <div key={cat} style={S.catRow}>
            <div style={S.catLeft}>
              <div style={{ ...S.catDot, backgroundColor: CAT_COLORS[cat] || "#94a3b8" }} />
              <span style={S.catName}>{cat}</span>
            </div>
            <div style={S.catRight}>
              <div style={S.catBarOuter}>
                <div style={{ ...S.catBarInner, width: `${pct(amt, b.totalExpense)}%`, backgroundColor: CAT_COLORS[cat] || "#94a3b8" }} />
              </div>
              <span style={S.catAmt}>¥{fmt(amt)}</span>
              <span style={S.catPct}>{pct(amt, b.totalExpense)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Income breakdown */}
      {sortedInc.length > 0 && (
        <>
          <h2 style={{ ...S.sectionTitle, marginTop: 24 }}>収入内訳</h2>
          <div style={S.catBreakdown}>
            {sortedInc.map(([cat, amt]) => (
              <div key={cat} style={S.catRow}>
                <div style={S.catLeft}>
                  <div style={{ ...S.catDot, backgroundColor: CAT_COLORS[cat] || "#22c55e" }} />
                  <span style={S.catName}>{cat}</span>
                </div>
                <div style={S.catRight}>
                  <span style={S.catAmt}>¥{fmt(amt)}</span>
                  <span style={S.catPct}>{pct(amt, b.totalIncome)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actual items (from receipts/manual) */}
      {b.actuals && b.actuals.length > 0 && (
        <>
          <h2 style={{ ...S.sectionTitle, marginTop: 24 }}>実績明細（{b.actuals.length}件）</h2>
          {b.actuals.sort((a, bb) => (a.date || "").localeCompare(bb.date || "")).map(a => (
            <div key={a.id} style={actualItemStyles.row}>
              <div style={actualItemStyles.left}>
                <div style={{ ...actualItemStyles.dot, backgroundColor: a.type === "income" ? "#22c55e" : "#ef4444" }} />
                <div>
                  <div style={actualItemStyles.name}>
                    {a.name}
                    {a.source === "receipt" && <span style={actualItemStyles.badge}>レシート</span>}
                  </div>
                  <div style={actualItemStyles.meta}>
                    {a.category}{a.date ? ` ・ ${a.date}` : ""}
                  </div>
                </div>
              </div>
              <div style={{
                ...actualItemStyles.amount,
                color: a.type === "income" ? "#22c55e" : "#ef4444",
              }}>
                {a.type === "income" ? "+" : "-"}¥{fmt(a.amount)}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Budget detailed items */}
      <h2 style={{ ...S.sectionTitle, marginTop: 24 }}>予算明細一覧</h2>
      {[...b.incomes, ...b.expenses].sort((a, bb) => (a.day || 0) - (bb.day || 0)).map(it => (
        <ItemRow key={it.id} item={it} onEdit={onEdit} onDelete={onDelete} />
      ))}
      {b.incomes.length === 0 && b.expenses.length === 0 && <div style={S.emptySmall}>この月の収支はありません</div>}
    </div>
  );
}

const actualSummaryStyles = {
  wrap: {
    marginTop: 20,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    border: "1px solid #bbf7d0",
  },
};

const actualItemStyles = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 6,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    borderLeft: "3px solid #22c55e",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    fontSize: 9,
    backgroundColor: "#7c3aed",
    color: "#fff",
    padding: "1px 6px",
    borderRadius: 4,
    fontWeight: 700,
  },
  meta: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 1,
  },
  amount: {
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
};
