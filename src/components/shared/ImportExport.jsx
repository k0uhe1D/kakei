import { useState } from "react";
import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function ImportExport({ data, onImport, onClose, toast, askConfirm }) {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const exportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `household-budget-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast("JSONエクスポート完了");
  };

  const exportCSV = () => {
    const rows = [["ID", "種別", "繰返し", "名目", "カテゴリ", "金額", "日", "開始月", "終了月", "対象月", "メモ"]];
    (data.items || []).forEach(it => {
      rows.push([
        it.id, it.type === "income" ? "収入" : "支出",
        it.recurring === false ? "単発" : "毎月",
        it.name, it.category, it.amount, it.day || "",
        it.startMonth || "", it.endMonth || "", it.specificMonth || "", it.memo || "",
      ]);
    });
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `household-budget-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast("CSVエクスポート完了");
  };

  const handleImport = async () => {
    setImportError("");
    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed.balance !== "number" || !Array.isArray(parsed.items)) {
        setImportError("データ形式が正しくありません（balance, items が必要）");
        return;
      }
      const ok = await askConfirm("現在のデータを上書きしてインポートしますか？");
      if (ok) {
        onImport(parsed);
        onClose();
      }
    } catch {
      setImportError("JSONの解析に失敗しました。正しいJSON形式か確認してください。");
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => toast("クリップボードにコピーしました")).catch(() => { });
  };

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 520 }}>
        <h3 style={S.modalTitle}>インポート / エクスポート</h3>

        <div style={S.ieSection}>
          <h4 style={S.ieHead}>エクスポート</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={S.ieBtn} onClick={exportJSON}>JSON ダウンロード</button>
            <button style={S.ieBtn} onClick={exportCSV}>CSV ダウンロード</button>
            <button style={{ ...S.ieBtn, ...S.ieBtnSec }} onClick={copyJSON}>JSONをコピー</button>
          </div>
          <div style={S.ieNote}>
            手持ち資金: ¥{fmt(data.balance)} ・ 登録数: {data.items.length}件
          </div>
        </div>

        <div style={{ ...S.ieSection, marginTop: 20 }}>
          <h4 style={S.ieHead}>インポート（JSON）</h4>
          <textarea style={S.ieTextarea} rows={6} placeholder='{"balance":100000,"items":[...]}'
            value={importText} onChange={e => setImportText(e.target.value)} />
          {importError && <div style={S.ieError}>{importError}</div>}
          <button style={{ ...S.ieBtn, marginTop: 8 }} onClick={handleImport} disabled={!importText.trim()}>
            インポート実行
          </button>
        </div>

        <button style={{ ...S.btnPrimary, ...S.btnCancel, marginTop: 16, width: "100%" }} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
