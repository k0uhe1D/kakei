import { CAT_COLORS } from "../../constants/categories";
import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function BudgetVsActualChart({ categoryComparison }) {
  if (!categoryComparison || categoryComparison.length === 0) return null;

  const maxAmount = Math.max(
    ...categoryComparison.map(c => Math.max(c.budget, c.actual)),
    1
  );

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={S.sectionTitle}>予算 vs 実績（カテゴリ別）</h3>
      <div style={chartStyles.container}>
        {categoryComparison.map(({ category, budget, actual, variance }) => (
          <div key={category} style={chartStyles.catGroup}>
            <div style={chartStyles.catHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ ...S.catDot, backgroundColor: CAT_COLORS[category] || "#94a3b8" }} />
                <span style={chartStyles.catName}>{category}</span>
              </div>
              <span style={{
                ...chartStyles.variance,
                color: variance > 0 ? "#ef4444" : variance < 0 ? "#22c55e" : "#94a3b8",
              }}>
                {variance > 0 ? "+" : ""}{fmt(variance)}
              </span>
            </div>

            {/* Budget bar */}
            <div style={chartStyles.barRow}>
              <span style={chartStyles.barLabel}>予算</span>
              <div style={chartStyles.barOuter}>
                <div style={{
                  ...chartStyles.barInner,
                  width: `${(budget / maxAmount) * 100}%`,
                  backgroundColor: "#93c5fd",
                }} />
              </div>
              <span style={chartStyles.barAmt}>¥{fmt(budget)}</span>
            </div>

            {/* Actual bar */}
            <div style={chartStyles.barRow}>
              <span style={chartStyles.barLabel}>実績</span>
              <div style={chartStyles.barOuter}>
                <div style={{
                  ...chartStyles.barInner,
                  width: `${(actual / maxAmount) * 100}%`,
                  backgroundColor: variance > 0 ? "#fca5a5" : "#86efac",
                }} />
              </div>
              <span style={chartStyles.barAmt}>¥{fmt(actual)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const chartStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  catGroup: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "12px 14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  catHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
  },
  variance: {
    fontSize: 12,
    fontWeight: 700,
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#94a3b8",
    minWidth: 28,
  },
  barOuter: {
    flex: 1,
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  barInner: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s",
  },
  barAmt: {
    fontSize: 11,
    fontWeight: 600,
    color: "#475569",
    minWidth: 70,
    textAlign: "right",
  },
};
