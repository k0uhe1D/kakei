import S from "../../styles/shared";

export default function ConfirmDialog({ message, onOk, onCancel }) {
  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7, marginBottom: 20, color: "#1e293b" }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btnPrimary} onClick={onOk}>OK</button>
          <button style={{ ...S.btnPrimary, ...S.btnCancel }} onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
