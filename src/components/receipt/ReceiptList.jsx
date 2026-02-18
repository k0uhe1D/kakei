import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function ReceiptList({ receipts }) {
  if (!receipts || receipts.length === 0) return null;

  const confirmed = receipts.filter(r => r.status === "confirmed");
  if (confirmed.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={S.sectionTitle}>レシート一覧（{confirmed.length}件）</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {confirmed.map(r => (
          <div key={r.id} style={listStyles.row}>
            <div style={listStyles.left}>
              {r.imageUrl && (
                <div style={listStyles.thumb}>
                  <img src={r.imageUrl} alt="" style={listStyles.thumbImg} />
                </div>
              )}
              <div>
                <div style={listStyles.store}>{r.confirmedStoreName || "不明"}</div>
                <div style={listStyles.meta}>
                  {r.confirmedCategory} {r.confirmedDate ? `・ ${r.confirmedDate}` : ""}
                </div>
              </div>
            </div>
            <div style={listStyles.amount}>
              -¥{fmt(r.confirmedAmount || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const listStyles = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    flexShrink: 0,
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  store: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
  },
  meta: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 1,
  },
  amount: {
    fontSize: 14,
    fontWeight: 800,
    color: "#ef4444",
  },
};
