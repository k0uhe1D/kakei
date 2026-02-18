import { useState, useEffect } from "react";
import { CATEGORIES } from "../../constants/categories";
import S from "../../styles/shared";

export default function ItemForm({ item, onSave, onCancel, months }) {
  const [type, setType] = useState(item?.type || "expense");
  const [recurring, setRecurring] = useState(item?.recurring !== false);
  const [name, setName] = useState(item?.name || "");
  const [amount, setAmount] = useState(item?.amount ? String(item.amount) : "");
  const [day, setDay] = useState(item?.day ? String(item.day) : "1");
  const [category, setCategory] = useState(item?.category || "");
  const [startMonth, setStartMonth] = useState(item?.startMonth || months[0].key);
  const [endMonth, setEndMonth] = useState(item?.endMonth || "");
  const [specificMonth, setSpecificMonth] = useState(item?.specificMonth || months[0].key);
  const [memo, setMemo] = useState(item?.memo || "");

  const cats = type === "income" ? CATEGORIES.income : CATEGORIES.expense;
  useEffect(() => { if (!cats.includes(category)) setCategory(cats[0]); }, [type]);

  const handleSubmit = () => {
    if (!name.trim() || !amount) return;
    const base = {
      ...(item || {}),
      id: item?.id,
      type, name: name.trim(),
      amount: Math.abs(Number(amount)),
      category, memo: memo.trim(),
    };
    if (recurring) {
      onSave({ ...base, recurring: true, day: Number(day) || 1, startMonth, endMonth: endMonth || "9999-12", specificMonth: undefined });
    } else {
      onSave({ ...base, recurring: false, specificMonth, day: Number(day) || 0, startMonth: undefined, endMonth: undefined });
    }
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <h3 style={S.modalTitle}>{item ? "収支を編集" : "収支を追加"}</h3>

        {/* Type */}
        <div style={S.toggleRow}>
          <button style={{ ...S.toggleBtn, ...(type === "income" ? S.toggleActive : {}) }}
            onClick={() => setType("income")}>収入</button>
          <button style={{ ...S.toggleBtn, ...(type === "expense" ? { ...S.toggleActive, backgroundColor: "#ef4444", borderColor: "#ef4444" } : {}) }}
            onClick={() => setType("expense")}>支出</button>
        </div>

        {/* Recurring toggle */}
        <div style={S.toggleRow}>
          <button style={{ ...S.toggleBtnSm, ...(recurring ? S.toggleSmActive : {}) }}
            onClick={() => setRecurring(true)}>毎月（定期）</button>
          <button style={{ ...S.toggleBtnSm, ...(!recurring ? { ...S.toggleSmActive, backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" } : {}) }}
            onClick={() => setRecurring(false)}>単発</button>
        </div>

        <label style={S.label}>名目</label>
        <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="例: 家賃、ボーナス" />

        <label style={S.label}>カテゴリ</label>
        <select style={S.input} value={category} onChange={e => setCategory(e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={S.label}>金額（円）</label>
        <input style={S.input} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例: 80000" />

        {recurring ? (
          <>
            <label style={S.label}>毎月の日付</label>
            <select style={S.input} value={day} onChange={e => setDay(e.target.value)}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}日</option>)}
            </select>

            <label style={S.label}>開始月</label>
            <select style={S.input} value={startMonth} onChange={e => setStartMonth(e.target.value)}>
              {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>

            <label style={S.label}>終了月（空欄＝継続）</label>
            <select style={S.input} value={endMonth} onChange={e => setEndMonth(e.target.value)}>
              <option value="">継続（終了なし）</option>
              {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </>
        ) : (
          <>
            <label style={S.label}>対象月</label>
            <select style={S.input} value={specificMonth} onChange={e => setSpecificMonth(e.target.value)}>
              {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>

            <label style={S.label}>日付（任意）</label>
            <select style={S.input} value={day} onChange={e => setDay(e.target.value)}>
              <option value="0">指定なし</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}日</option>)}
            </select>
          </>
        )}

        <label style={S.label}>メモ（任意）</label>
        <input style={S.input} value={memo} onChange={e => setMemo(e.target.value)} placeholder="例: 引越し費用" />

        <div style={S.formActions}>
          <button style={S.btnPrimary} onClick={handleSubmit}>{item ? "更新" : "追加"}</button>
          <button style={{ ...S.btnPrimary, ...S.btnCancel }} onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
