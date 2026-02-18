import { useRef } from "react";
import S from "../../styles/shared";

export default function ReceiptUploadModal({ onFileSelected, onCancel, uploading, uploadProgress, processing }) {
  const cameraRef = useRef(null);
  const albumRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const isWorking = uploading || processing;

  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 400 }}>
        <h3 style={S.modalTitle}>レシートを読み取る</h3>

        {isWorking ? (
          <div style={receiptStyles.progressWrap}>
            {uploading && (
              <>
                <div style={receiptStyles.progressLabel}>アップロード中...</div>
                <div style={receiptStyles.progressBarOuter}>
                  <div style={{ ...receiptStyles.progressBarInner, width: `${uploadProgress}%` }} />
                </div>
                <div style={receiptStyles.progressPct}>{Math.round(uploadProgress)}%</div>
              </>
            )}
            {processing && (
              <>
                <div style={receiptStyles.spinner} />
                <div style={receiptStyles.progressLabel}>OCR処理中...</div>
                <div style={receiptStyles.progressSub}>レシートを解析しています</div>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={receiptStyles.buttonGroup}>
              <button
                style={receiptStyles.bigBtn}
                onClick={() => cameraRef.current?.click()}
              >
                <div style={receiptStyles.bigBtnIcon}>📷</div>
                <div style={receiptStyles.bigBtnLabel}>カメラで撮影</div>
              </button>
              <button
                style={receiptStyles.bigBtn}
                onClick={() => albumRef.current?.click()}
              >
                <div style={receiptStyles.bigBtnIcon}>🖼️</div>
                <div style={receiptStyles.bigBtnLabel}>アルバムから選択</div>
              </button>
            </div>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            <input
              ref={albumRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </>
        )}

        {!isWorking && (
          <button
            style={{ ...S.btnPrimary, ...S.btnCancel, marginTop: 16, width: "100%" }}
            onClick={onCancel}
          >
            キャンセル
          </button>
        )}
      </div>
    </div>
  );
}

const receiptStyles = {
  buttonGroup: {
    display: "flex",
    gap: 12,
    marginBottom: 8,
  },
  bigBtn: {
    flex: 1,
    padding: "24px 16px",
    borderRadius: 16,
    border: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
  },
  bigBtnIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  bigBtnLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
  },
  progressWrap: {
    textAlign: "center",
    padding: "32px 0",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 12,
  },
  progressSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
  },
  progressBarOuter: {
    width: "100%",
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
    transition: "width 0.3s",
  },
  progressPct: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    fontWeight: 600,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
};
