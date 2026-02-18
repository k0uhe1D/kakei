import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function Forecast({ balances, onViewMonth }) {
  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>月別予測（12ヶ月）</h2>
      <div style={S.table} className="table-responsive">
        <div className="table-min-width" style={{ minWidth: balances.some(b => b.hasActuals) ? 700 : 600 }}>
          <div style={S.tHeader}>
            <div style={S.thM}>月</div>
            <div style={S.thN}>収入</div>
            <div style={S.thN}>支出</div>
            <div style={S.thN}>余剰</div>
            {balances.some(b => b.hasActuals) && (
              <>
                <div style={{ ...S.thN, color: "#22c55e" }}>実績支出</div>
              </>
            )}
            <div style={S.thN}>累計残高</div>
            <div style={{ width: 32 }} />
          </div>
          {balances.map(b => (
            <div key={b.key} style={{
              ...S.tRow,
              ...(b.hasActuals ? { backgroundColor: "#f0fdf4" } : {}),
            }}>
              <div style={S.tdM}>
                {b.label}
                {b.hasActuals && <span style={forecastStyles.actualBadge}>実績有</span>}
              </div>
              <div style={{ ...S.tdN, color: "#22c55e" }}>+{fmt(b.totalIncome)}</div>
              <div style={{ ...S.tdN, color: "#ef4444" }}>-{fmt(b.totalExpense)}</div>
              <div style={{ ...S.tdN, color: b.surplus >= 0 ? "#3b82f6" : "#ef4444", fontWeight: 600 }}>
                {b.surplus >= 0 ? "+" : ""}{fmt(b.surplus)}
              </div>
              {balances.some(x => x.hasActuals) && (
                <div style={{ ...S.tdN, color: "#059669", fontWeight: b.hasActuals ? 700 : 400 }}>
                  {b.hasActuals ? `-${fmt(b.actualExpense)}` : "-"}
                </div>
              )}
              <div style={{ ...S.tdN, fontWeight: 700, color: b.cumulativeBalance >= 0 ? "#0f172a" : "#ef4444" }}>
                ¥{fmt(b.cumulativeBalance)}
              </div>
              <button style={S.detailBtn} onClick={() => onViewMonth(b.key)}>▶</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const forecastStyles = {
  actualBadge: {
    display: "inline-block",
    fontSize: 8,
    backgroundColor: "#22c55e",
    color: "#fff",
    padding: "1px 4px",
    borderRadius: 3,
    fontWeight: 700,
    marginLeft: 4,
    verticalAlign: "middle",
  },
};
