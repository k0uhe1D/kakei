import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function BudgetVsActualCard({ balance }) {
  if (!balance || !balance.hasActuals) return null;

  const {
    totalIncome, totalExpense, surplus,
    actualIncome, actualExpense, actualSurplus,
    incomeVariance, expenseVariance,
  } = balance;

  return (
    <div style={cardStyles.container}>
      <h3 style={S.sectionTitle}>予算 vs 実績（今月）</h3>
      <div style={cardStyles.grid}>
        {/* Income comparison */}
        <div style={cardStyles.item}>
          <div style={cardStyles.label}>収入</div>
          <div style={cardStyles.row}>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>予算</div>
              <div style={{ ...cardStyles.value, color: "#94a3b8" }}>¥{fmt(totalIncome)}</div>
            </div>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>実績</div>
              <div style={{ ...cardStyles.value, color: "#22c55e" }}>¥{fmt(actualIncome)}</div>
            </div>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>差額</div>
              <div style={{
                ...cardStyles.value,
                color: incomeVariance >= 0 ? "#22c55e" : "#ef4444",
              }}>
                {incomeVariance >= 0 ? "+" : ""}{fmt(incomeVariance)}
              </div>
            </div>
          </div>
        </div>

        {/* Expense comparison */}
        <div style={cardStyles.item}>
          <div style={cardStyles.label}>支出</div>
          <div style={cardStyles.row}>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>予算</div>
              <div style={{ ...cardStyles.value, color: "#94a3b8" }}>¥{fmt(totalExpense)}</div>
            </div>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>実績</div>
              <div style={{ ...cardStyles.value, color: "#ef4444" }}>¥{fmt(actualExpense)}</div>
            </div>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>差額</div>
              <div style={{
                ...cardStyles.value,
                color: expenseVariance <= 0 ? "#22c55e" : "#ef4444",
              }}>
                {expenseVariance >= 0 ? "+" : ""}{fmt(expenseVariance)}
              </div>
            </div>
          </div>
        </div>

        {/* Surplus comparison */}
        <div style={{ ...cardStyles.item, borderBottom: "none" }}>
          <div style={cardStyles.label}>余剰</div>
          <div style={cardStyles.row}>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>予算</div>
              <div style={{ ...cardStyles.value, color: "#94a3b8" }}>¥{fmt(surplus)}</div>
            </div>
            <div style={cardStyles.col}>
              <div style={cardStyles.sublabel}>実績</div>
              <div style={{
                ...cardStyles.value,
                color: actualSurplus >= 0 ? "#3b82f6" : "#ef4444",
              }}>
                ¥{fmt(actualSurplus)}
              </div>
            </div>
            <div style={cardStyles.col} />
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyles = {
  container: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  grid: {},
  item: {
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 6,
  },
  row: {
    display: "flex",
    gap: 8,
  },
  col: {
    flex: 1,
    textAlign: "center",
  },
  sublabel: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: 600,
  },
  value: {
    fontSize: 14,
    fontWeight: 800,
    marginTop: 2,
  },
};
