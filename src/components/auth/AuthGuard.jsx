import { useAuth } from "../../contexts/AuthContext";
import LoginPage from "./LoginPage";
import S from "../../styles/shared";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={S.loadingWrap}>
        <div style={S.loadingText}>読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}
