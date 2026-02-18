import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import S from "../../styles/shared";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, signInAsGuest, sendMagicLink } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup | magiclink
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const messages = {
        "auth/invalid-email": "メールアドレスの形式が正しくありません",
        "auth/user-not-found": "アカウントが見つかりません",
        "auth/wrong-password": "パスワードが正しくありません",
        "auth/email-already-in-use": "このメールアドレスは既に使用されています",
        "auth/weak-password": "パスワードは6文字以上にしてください",
        "auth/invalid-credential": "メールアドレスまたはパスワードが正しくありません",
      };
      setError(messages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      const messages = {
        "auth/invalid-email": "メールアドレスの形式が正しくありません",
        "auth/missing-email": "メールアドレスを入力してください",
      };
      setError(messages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Googleログインに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError("");
    setLoading(true);
    try {
      await signInAsGuest();
    } catch (err) {
      setError("ゲストログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setMagicLinkSent(false);
  };

  // Magic link sent confirmation
  if (magicLinkSent) {
    return (
      <div style={ls.wrapper}>
        <div style={ls.card}>
          <h1 style={S.title}>家計プランナー</h1>
          <div style={ls.sentIcon}>✉️</div>
          <p style={{ ...ls.subtitle, marginBottom: 8 }}>ログインリンクを送信しました</p>
          <p style={ls.sentDesc}>
            <strong>{email}</strong> にログインリンクを送信しました。
            メール内のリンクをクリックしてログインしてください。
          </p>
          <button
            style={{ ...ls.secondaryBtn, marginTop: 20 }}
            onClick={() => setMagicLinkSent(false)}
          >
            メールアドレスを変更する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={ls.wrapper}>
      <div style={ls.card}>
        <h1 style={S.title}>家計プランナー</h1>
        <p style={ls.subtitle}>
          {mode === "signup" ? "アカウント作成" : mode === "magiclink" ? "メールリンクでログイン" : "ログイン"}
        </p>

        {mode === "magiclink" ? (
          <form onSubmit={handleMagicLink}>
            <label style={S.label}>メールアドレス</label>
            <input
              style={S.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
            <p style={ls.magicHint}>パスワード不要。メールに届くリンクからログインできます。</p>

            {error && <div style={ls.error}>{error}</div>}

            <button
              type="submit"
              style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}
              disabled={loading}
            >
              {loading ? "送信中..." : "ログインリンクを送信"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={S.label}>メールアドレス</label>
            <input
              style={S.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />

            <label style={S.label}>パスワード</label>
            <input
              style={S.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              minLength={6}
              required
            />

            {error && <div style={ls.error}>{error}</div>}

            <button
              type="submit"
              style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}
              disabled={loading}
            >
              {loading ? "処理中..." : mode === "signup" ? "アカウント作成" : "ログイン"}
            </button>
          </form>
        )}

        {mode !== "magiclink" && (
          <button
            style={ls.magicLinkBtn}
            onClick={() => switchMode("magiclink")}
            disabled={loading}
          >
            パスワードなしでログイン（メールリンク）
          </button>
        )}

        {mode === "magiclink" && (
          <button
            style={ls.magicLinkBtn}
            onClick={() => switchMode("login")}
            disabled={loading}
          >
            パスワードでログイン
          </button>
        )}

        <div style={ls.divider}>
          <span style={ls.dividerText}>または</span>
        </div>

        <div style={ls.socialBtns}>
          <button
            style={ls.googleBtn}
            onClick={handleGoogle}
            disabled={loading}
          >
            Googleでログイン
          </button>

          <button
            style={ls.guestBtn}
            onClick={handleGuest}
            disabled={loading}
          >
            ゲストとして利用（登録不要）
          </button>
        </div>

        <div style={ls.switchRow}>
          {mode === "signup" ? (
            <>
              <span style={ls.switchText}>既にアカウントをお持ちですか？</span>
              <button style={ls.switchBtn} onClick={() => switchMode("login")}>
                ログイン
              </button>
            </>
          ) : (
            <>
              <span style={ls.switchText}>アカウントをお持ちでないですか？</span>
              <button style={ls.switchBtn} onClick={() => switchMode("signup")}>
                新規登録
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ls = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: "32px 24px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 8,
    padding: "8px 12px",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
  magicHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  magicLinkBtn: {
    width: "100%",
    padding: 10,
    marginTop: 12,
    borderRadius: 10,
    border: "none",
    backgroundColor: "transparent",
    color: "#3b82f6",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "16px 0",
    gap: 12,
  },
  dividerText: {
    fontSize: 12,
    color: "#94a3b8",
    flex: "none",
    margin: "0 auto",
    position: "relative",
    backgroundColor: "#fff",
    padding: "0 12px",
  },
  socialBtns: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  googleBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#1e293b",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  guestBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  secondaryBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#1e293b",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  sentIcon: {
    textAlign: "center",
    fontSize: 48,
    margin: "16px 0",
  },
  sentDesc: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.6,
  },
  switchRow: {
    textAlign: "center",
    marginTop: 20,
  },
  switchText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    marginLeft: 4,
  },
};
