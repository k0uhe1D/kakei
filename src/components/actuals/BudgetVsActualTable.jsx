import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function BudgetVsActualTable({ categoryComparison }) {
  if (!categoryComparison || categoryComparison.length === 0) return null;

  const totalBudget = categoryComparison.reduce((s, c) => s + c.budget, 0);
  const totalActual = categoryComparison.reduce((s, c) => s + c.actual, 0);
  const totalVariance = totalActual - totalBudget;

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={S.sectionTitle}>予算 vs 実績（詳細）</h3>
      <div style={S.table}>
        <div style={{ ...S.tHeader, fontSize: 10 }}>
          <div style={{ flex: 1.5 }}>カテゴリ</div>
          <div style={{ flex: 1, textAlign: "right" }}>予算</div>
          <div style={{ flex: 1, textAlign: "right" }}>実績</div>
          <div style={{ flex: 1, textAlign: "right" }}>差額</div>
        </div>
        {categoryComparison.map(({ category, budget, actual, variance }) => (
          <div key={category} style={S.tRow}>
            <div style={{ flex: 1.5, fontWeight: 600, fontSize: 11 }}>{category}</div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 11, color: "#64748b" }}>
              ¥{fmt(budget)}
            </div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 11, fontWeight: 600 }}>
              ¥{fmt(actual)}
            </div>
            <div style={{
              flex: 1, textAlign: "right", fontSize: 11, fontWeight: 700,
              color: variance > 0 ? "#ef4444" : variance < 0 ? "#22c55e" : "#94a3b8",
            }}>
              {variance > 0 ? "+" : ""}{fmt(variance)}
            </div>
          </div>
        ))}
        {/* Total row */}
        <div style={{ ...S.tRow, backgroundColor: "#f8fafc", fontWeight: 700 }}>
          <div style={{ flex: 1.5, fontSize: 12 }}>合計</div>
          <div style={{ flex: 1, textAlign: "right", fontSize: 12 }}>¥{fmt(totalBudget)}</div>
          <div style={{ flex: 1, textAlign: "right", fontSize: 12 }}>¥{fmt(totalActual)}</div>
          <div style={{
            flex: 1, textAlign: "right", fontSize: 12,
            color: totalVariance > 0 ? "#ef4444" : totalVariance < 0 ? "#22c55e" : "#94a3b8",
          }}>
            {totalVariance > 0 ? "+" : ""}{fmt(totalVariance)}
          </div>
        </div>
      </div>
    </div>
  );
}
