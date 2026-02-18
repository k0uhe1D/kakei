import { useState, useCallback } from "react";
import "./App.css";

import { gid } from "./utils/id";
import S from "./styles/shared";
import { useAuth } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";
import useBudgetData from "./hooks/useBudgetData";
import useActuals from "./hooks/useActuals";
import useReceipts from "./hooks/useReceipts";
import useMonthCalculations from "./hooks/useMonthCalculations";

import Dashboard from "./components/dashboard/Dashboard";
import ItemList from "./components/items/ItemList";
import ItemForm from "./components/items/ItemForm";
import Forecast from "./components/forecast/Forecast";
import Analysis from "./components/analysis/Analysis";
import MonthReport from "./components/report/MonthReport";
import ConfirmDialog from "./components/shared/ConfirmDialog";
import ImportExport from "./components/shared/ImportExport";
import ReceiptUploadModal from "./components/receipt/ReceiptUploadModal";
import ReceiptOcrReview from "./components/receipt/ReceiptOcrReview";
import { fmt } from "./utils/format";

export default function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}

function AppContent() {
  const { user, signOut, isAnonymous, signInWithGoogle, sendMagicLink, linkEmailPassword } = useAuth();
  const {
    items, balance, loading,
    saveItem: firestoreSaveItem, deleteItem: firestoreDeleteItem,
    saveBalance,
    migrationInfo, doMigration, dismissMigration,
    data,
  } = useBudgetData();
  const { actuals, addActual } = useActuals();
  const { months, balances } = useMonthCalculations(data, actuals);
  const receipt = useReceipts();

  const [view, setView] = useState("dashboard");
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [balanceEdit, setBalanceEdit] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);
  const [detailMonth, setDetailMonth] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showReceiptReview, setShowReceiptReview] = useState(false);
  const [receiptResult, setReceiptResult] = useState(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkMode, setLinkMode] = useState("email"); // email | magiclink
  const [linkError, setLinkError] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const askConfirm = (message) => new Promise(resolve => {
    setConfirmDialog({ message, onOk: () => { setConfirmDialog(null); resolve(true); }, onCancel: () => { setConfirmDialog(null); resolve(false); } });
  });

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const deleteItem = async (id) => {
    const item = items.find(it => it.id === id);
    const ok = await askConfirm(`「${item?.name || ""}」を削除しますか？`);
    if (ok) await firestoreDeleteItem(id);
  };

  const saveItem = async (item) => {
    if (!item.id) {
      item.id = gid();
    }
    await firestoreSaveItem(item);
    setShowForm(false);
    setEditItem(null);
  };

  const handleImport = useCallback(async (importedData) => {
    await saveBalance(importedData.balance || 0);
    for (const item of (importedData.items || [])) {
      await firestoreSaveItem({ ...item, id: item.id || gid() });
    }
    toast("インポート完了");
  }, [saveBalance, firestoreSaveItem]);

  // Receipt flow
  const handleReceiptFile = async (file) => {
    try {
      const result = await receipt.upload(file);
      setShowReceiptUpload(false);
      setReceiptResult(result);
      setShowReceiptReview(true);
    } catch {
      toast("レシートの処理に失敗しました");
      setShowReceiptUpload(false);
    }
  };

  const handleReceiptConfirm = async (confirmedData) => {
    if (!receiptResult) return;
    try {
      // Save receipt confirmation
      await receipt.confirmReceipt(receiptResult.receiptId, confirmedData);
      // Create actual entry
      await addActual({
        monthKey: confirmedData.monthKey,
        type: "expense",
        category: confirmedData.category,
        amount: confirmedData.amount,
        name: confirmedData.storeName || "レシート支出",
        date: confirmedData.date,
        memo: "",
        receiptId: receiptResult.receiptId,
        source: "receipt",
      });
      setShowReceiptReview(false);
      setReceiptResult(null);
      receipt.reset();
      toast("実績を登録しました");
    } catch {
      toast("登録に失敗しました");
    }
  };

  if (loading) return <div style={S.loadingWrap}><div style={S.loadingText}>読み込み中...</div></div>;

  const navItems = [
    ["dashboard", "概要"],
    ["items", "収支一覧"],
    ["forecast", "月別予測"],
    ["analysis", "分析"],
  ];

  return (
    <div style={S.root} className="container">
      {toastMsg && <div style={S.toast}>{toastMsg}</div>}

      {/* Anonymous User Banner */}
      {isAnonymous && (
        <div style={anonStyles.banner}>
          <div style={anonStyles.text}>
            ゲストモードで利用中です。データを保持するにはアカウントを作成してください。
          </div>
          <div style={migrationStyles.actions}>
            <button style={migrationStyles.btnMigrate} onClick={() => setShowLinkAccount(true)}>
              アカウント作成
            </button>
          </div>
        </div>
      )}

      {/* Link Account Modal */}
      {showLinkAccount && (
        <div className="modal-overlay" onClick={() => setShowLinkAccount(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ ...S.title, marginBottom: 16 }}>アカウントを作成</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              現在のデータを引き継いでアカウントを作成します。
            </p>

            {linkSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>ログインリンクを送信しました</p>
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  <strong>{linkEmail}</strong> にリンクを送信しました。メール内のリンクをクリックしてアカウントを連携してください。
                </p>
                <button style={{ ...S.btnPrimary, marginTop: 16 }} onClick={() => { setShowLinkAccount(false); setLinkSent(false); }}>
                  閉じる
                </button>
              </div>
            ) : (
              <>
                {linkMode === "magiclink" ? (
                  <>
                    <label style={S.label}>メールアドレス</label>
                    <input style={S.input} type="email" value={linkEmail}
                      onChange={e => setLinkEmail(e.target.value)} placeholder="example@email.com" />
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      パスワード不要。メールに届くリンクからアカウントを連携できます。
                    </p>
                  </>
                ) : (
                  <>
                    <label style={S.label}>メールアドレス</label>
                    <input style={S.input} type="email" value={linkEmail}
                      onChange={e => setLinkEmail(e.target.value)} placeholder="example@email.com" />
                    <label style={S.label}>パスワード</label>
                    <input style={S.input} type="password" value={linkPassword}
                      onChange={e => setLinkPassword(e.target.value)} placeholder="6文字以上" minLength={6} />
                  </>
                )}

                {linkError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8, padding: "8px 12px", backgroundColor: "#fef2f2", borderRadius: 8 }}>{linkError}</div>}

                <button
                  style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}
                  disabled={linkLoading}
                  onClick={async () => {
                    setLinkError("");
                    setLinkLoading(true);
                    try {
                      if (linkMode === "magiclink") {
                        await sendMagicLink(linkEmail);
                        setLinkSent(true);
                      } else {
                        await linkEmailPassword(linkEmail, linkPassword);
                        setShowLinkAccount(false);
                        toast("アカウント作成完了！");
                      }
                    } catch (err) {
                      const msgs = {
                        "auth/email-already-in-use": "このメールアドレスは既に使用されています",
                        "auth/invalid-email": "メールアドレスの形式が正しくありません",
                        "auth/weak-password": "パスワードは6文字以上にしてください",
                      };
                      setLinkError(msgs[err.code] || err.message);
                    } finally {
                      setLinkLoading(false);
                    }
                  }}
                >
                  {linkLoading ? "処理中..." : linkMode === "magiclink" ? "リンクを送信" : "アカウント作成"}
                </button>

                <button
                  style={{ width: "100%", padding: 10, marginTop: 8, border: "none", backgroundColor: "transparent", color: "#3b82f6", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  onClick={() => { setLinkMode(linkMode === "email" ? "magiclink" : "email"); setLinkError(""); }}
                >
                  {linkMode === "email" ? "パスワードなしでリンク（メールリンク）" : "パスワードでアカウント作成"}
                </button>

                <div style={{ display: "flex", alignItems: "center", margin: "12px 0", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", margin: "0 auto" }}>または</span>
                </div>

                <button
                  style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid #e2e8f0", backgroundColor: "#fff", color: "#1e293b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  disabled={linkLoading}
                  onClick={async () => {
                    setLinkError("");
                    setLinkLoading(true);
                    try {
                      await signInWithGoogle();
                      setShowLinkAccount(false);
                      toast("Googleアカウントと連携しました！");
                    } catch (err) {
                      if (err.code !== "auth/popup-closed-by-user") {
                        setLinkError("Googleアカウントとの連携に失敗しました");
                      }
                    } finally {
                      setLinkLoading(false);
                    }
                  }}
                >
                  Googleアカウントと連携
                </button>

                <button
                  style={{ width: "100%", padding: 10, marginTop: 12, border: "none", backgroundColor: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}
                  onClick={() => setShowLinkAccount(false)}
                >
                  あとで
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Migration Banner */}
      {migrationInfo && migrationInfo.reason === "ready" && (
        <div style={migrationStyles.banner}>
          <div style={migrationStyles.text}>
            ローカルデータが見つかりました（{migrationInfo.itemCount}件）。クラウドに移行しますか？
          </div>
          <div style={migrationStyles.actions}>
            <button style={migrationStyles.btnMigrate} onClick={async () => { await doMigration(); toast("データ移行完了"); }}>
              移行する
            </button>
            <button style={migrationStyles.btnDismiss} onClick={dismissMigration}>
              スキップ
            </button>
          </div>
        </div>
      )}

      <header style={S.header}>
        <h1 style={S.title}>家計プランナー</h1>
        <div style={S.headerActions}>
          <button style={S.headerBtn} onClick={() => setShowImportExport(true)}>
            インポート / エクスポート
          </button>
          <button style={{ ...S.headerBtn, marginLeft: 8 }} onClick={signOut}>
            ログアウト
          </button>
        </div>
      </header>

      {/* Balance */}
      <div className="balance-card">
        <div style={S.balanceLabel}>現在の手持ち資金</div>
        {balanceEdit ? (
          <div style={S.balanceEditRow}>
            <input style={S.balanceInput} type="number" value={balanceInput}
              onChange={e => setBalanceInput(e.target.value)} autoFocus placeholder="金額" />
            <button style={S.btnSmall} onClick={() => { saveBalance(Number(balanceInput) || 0); setBalanceEdit(false); }}>保存</button>
            <button style={{ ...S.btnSmall, ...S.btnCancelSm }} onClick={() => setBalanceEdit(false)}>取消</button>
          </div>
        ) : (
          <div className="balance-value" onClick={() => { setBalanceInput(String(balance)); setBalanceEdit(true); }}>
            ¥{fmt(balance)}<span style={S.editHint}>タップで編集</span>
          </div>
        )}
      </div>

      {/* Nav Desktop */}
      <div className="nav-desktop">
        {navItems.map(([key, label]) => (
          <button key={key} style={{ ...S.navBtn, ...(view === key ? S.navBtnActive : {}) }}
            onClick={() => { setView(key); setDetailMonth(null); }}>{label}</button>
        ))}
      </div>

      {/* Nav Mobile (Bottom) */}
      <div className="nav-mobile">
        {navItems.map(([key, label]) => (
          <button key={key} className={`nav-item ${view === key ? "active" : ""}`}
            onClick={() => { setView(key); setDetailMonth(null); }}>
            <div style={{ fontSize: 18 }}>{key === "dashboard" ? "🏠" : key === "items" ? "📝" : key === "forecast" ? "📈" : "📊"}</div>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Add Button (Desktop) - two buttons side by side */}
      <div className="btn-add-desktop-wrap">
        <button className="btn-add-desktop" onClick={() => { setEditItem(null); setShowForm(true); }}>
          ＋ 収支を追加
        </button>
        <button className="btn-add-desktop" onClick={() => setShowReceiptUpload(true)}
          style={{ borderColor: "#a78bfa", color: "#7c3aed" }}>
          📷 レシート撮影
        </button>
      </div>

      {/* FAB Speed Dial for Mobile */}
      {showFabMenu && (
        <div style={fabStyles.overlay} onClick={() => setShowFabMenu(false)} />
      )}
      {showFabMenu && (
        <div style={fabStyles.speedDial}>
          <button style={fabStyles.speedDialBtn} onClick={() => { setShowFabMenu(false); setEditItem(null); setShowForm(true); }}>
            <span style={fabStyles.speedDialIcon}>📝</span>
            <span style={fabStyles.speedDialLabel}>収支を追加</span>
          </button>
          <button style={fabStyles.speedDialBtn} onClick={() => { setShowFabMenu(false); setShowReceiptUpload(true); }}>
            <span style={fabStyles.speedDialIcon}>📷</span>
            <span style={fabStyles.speedDialLabel}>レシート撮影</span>
          </button>
        </div>
      )}
      <button className="fab-add" onClick={() => setShowFabMenu(!showFabMenu)}
        style={showFabMenu ? { transform: "rotate(45deg)" } : {}}>
        ＋
      </button>

      {/* Modals */}
      {showForm && <ItemForm item={editItem} onSave={saveItem}
        onCancel={() => { setShowForm(false); setEditItem(null); }} months={months} />}

      {confirmDialog && <ConfirmDialog message={confirmDialog.message} onOk={confirmDialog.onOk} onCancel={confirmDialog.onCancel} />}

      {showImportExport && <ImportExport data={data} onImport={handleImport}
        onClose={() => setShowImportExport(false)} toast={toast} askConfirm={askConfirm} />}

      {showReceiptUpload && (
        <ReceiptUploadModal
          onFileSelected={handleReceiptFile}
          onCancel={() => { setShowReceiptUpload(false); receipt.reset(); }}
          uploading={receipt.uploading}
          uploadProgress={receipt.uploadProgress}
          processing={receipt.processing}
        />
      )}

      {showReceiptReview && receiptResult && (
        <ReceiptOcrReview
          ocrResult={receiptResult.ocrResult}
          imageUrl={receiptResult.imageUrl}
          onConfirm={handleReceiptConfirm}
          onCancel={() => { setShowReceiptReview(false); setReceiptResult(null); receipt.reset(); }}
        />
      )}

      <main style={{ marginBottom: 40 }}>
        {view === "dashboard" && <Dashboard balances={balances} data={data} onViewMonth={(mk) => { setDetailMonth(mk); setView("report"); }} />}
        {view === "items" && <ItemList items={items} onEdit={it => { setEditItem(it); setShowForm(true); }} onDelete={deleteItem} />}
        {view === "forecast" && <Forecast balances={balances} onViewMonth={(mk) => { setDetailMonth(mk); setView("report"); }} />}
        {view === "analysis" && <Analysis balances={balances} data={data} />}
        {view === "report" && <MonthReport balances={balances} monthKey={detailMonth || months[0].key}
          onChangeMonth={setDetailMonth} months={months}
          onEdit={it => { setEditItem(it); setShowForm(true); }} onDelete={deleteItem} />}
      </main>

      <footer style={S.footer}>
        <button style={S.resetBtn} onClick={async () => {
          if (await askConfirm("すべてのデータをリセットしますか？")) {
            await saveBalance(0);
            for (const item of items) {
              await firestoreDeleteItem(item.id);
            }
          }
        }}>
          データリセット
        </button>
      </footer>
    </div>
  );
}

const fabStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 80,
  },
  speedDial: {
    position: "fixed",
    bottom: 158,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 91,
  },
  speedDialBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 28,
    border: "none",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  speedDialIcon: {
    fontSize: 20,
  },
  speedDialLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
  },
};

const anonStyles = {
  banner: {
    backgroundColor: "#fefce8",
    border: "1px solid #fde68a",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 16,
  },
  text: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: 600,
    marginBottom: 8,
  },
};

const migrationStyles = {
  banner: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 16,
  },
  text: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: 600,
    marginBottom: 8,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  btnMigrate: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  },
  btnDismiss: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#e2e8f0",
    color: "#64748b",
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  },
};
