import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import S from "../../styles/shared";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
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

  return (
    <div style={loginStyles.wrapper}>
      <div style={loginStyles.card}>
        <h1 style={S.title}>家計プランナー</h1>
        <p style={loginStyles.subtitle}>
          {isSignUp ? "アカウント作成" : "ログイン"}
        </p>

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

          {error && <div style={loginStyles.error}>{error}</div>}

          <button
            type="submit"
            style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}
            disabled={loading}
          >
            {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </button>
        </form>

        <div style={loginStyles.divider}>
          <span style={loginStyles.dividerText}>または</span>
        </div>

        <button
          style={loginStyles.googleBtn}
          onClick={handleGoogle}
          disabled={loading}
        >
          Googleでログイン
        </button>

        <div style={loginStyles.switchRow}>
          <span style={loginStyles.switchText}>
            {isSignUp ? "既にアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}
          </span>
          <button
            style={loginStyles.switchBtn}
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
          >
            {isSignUp ? "ログイン" : "新規登録"}
          </button>
        </div>
      </div>
    </div>
  );
}

const loginStyles = {
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
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
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
