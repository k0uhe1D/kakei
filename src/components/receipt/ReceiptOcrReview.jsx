import { useState, useEffect } from "react";
import { CATEGORIES } from "../../constants/categories";
import { getMonthLabels } from "../../utils/month";
import S from "../../styles/shared";

export default function ReceiptOcrReview({ ocrResult, imageUrl, onConfirm, onCancel }) {
  const months = getMonthLabels();

  const [amount, setAmount] = useState("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [monthKey, setMonthKey] = useState(months[0].key);

  useEffect(() => {
    if (ocrResult) {
      setAmount(String(ocrResult.totalAmount || ""));
      setStoreName(ocrResult.storeName || "");
      setCategory(ocrResult.suggestedCategory || "その他支出");
      if (ocrResult.date) {
        setDate(ocrResult.date);
        // Auto-set monthKey from date
        const parts = ocrResult.date.split("-");
        if (parts.length >= 2) {
          const mk = `${parts[0]}-${parts[1]}`;
          const found = months.find(m => m.key === mk);
          if (found) setMonthKey(mk);
        }
      }
    }
  }, [ocrResult]);

  const handleConfirm = () => {
    if (!amount) return;
    onConfirm({
      amount: Math.abs(Number(amount)),
      storeName: storeName.trim(),
      category,
      date,
      monthKey,
    });
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <h3 style={S.modalTitle}>レシート確認</h3>

        {/* Image thumbnail */}
        {imageUrl && (
          <div style={reviewStyles.imageWrap}>
            <img src={imageUrl} alt="レシート" style={reviewStyles.image} />
          </div>
        )}

        {/* Amount - displayed prominently */}
        <div style={reviewStyles.amountSection}>
          <label style={S.label}>合計金額（円）</label>
          <input
            style={{ ...S.input, fontSize: 24, fontWeight: 800, textAlign: "center" }}
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <label style={S.label}>店舗名</label>
        <input
          style={S.input}
          value={storeName}
          onChange={e => setStoreName(e.target.value)}
          placeholder="店舗名"
        />

        <label style={S.label}>カテゴリ</label>
        <select style={S.input} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.expense.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={S.label}>日付</label>
        <input
          style={S.input}
          type="date"
          value={date}
          onChange={e => {
            setDate(e.target.value);
            const parts = e.target.value.split("-");
            if (parts.length >= 2) {
              const mk = `${parts[0]}-${parts[1]}`;
              setMonthKey(mk);
            }
          }}
        />

        <label style={S.label}>対象月</label>
        <select style={S.input} value={monthKey} onChange={e => setMonthKey(e.target.value)}>
          {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>

        {/* OCR details */}
        {ocrResult?.items?.length > 0 && (
          <details style={reviewStyles.details}>
            <summary style={reviewStyles.summary}>明細 ({ocrResult.items.length}件)</summary>
            <div style={reviewStyles.itemList}>
              {ocrResult.items.map((item, i) => (
                <div key={i} style={reviewStyles.itemRow}>
                  <span style={reviewStyles.itemName}>{item.name}</span>
                  <span style={reviewStyles.itemAmt}>¥{(item.amount || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        <div style={S.formActions}>
          <button style={S.btnPrimary} onClick={handleConfirm}>
            確認して登録
          </button>
          <button style={{ ...S.btnPrimary, ...S.btnCancel }} onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

const reviewStyles = {
  imageWrap: {
    width: "100%",
    maxHeight: 200,
    overflow: "hidden",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f1f5f9",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    maxHeight: 200,
  },
  amountSection: {
    marginBottom: 8,
  },
  details: {
    marginTop: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
  },
  summary: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    cursor: "pointer",
  },
  itemList: {
    marginTop: 8,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontSize: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  itemName: {
    color: "#475569",
  },
  itemAmt: {
    fontWeight: 600,
    color: "#1e293b",
  },
};
