import { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function getRedirectPath() {
  const redirectPath = window.sessionStorage.getItem("otoato_auth_redirect") || "/mypage";
  window.sessionStorage.removeItem("otoato_auth_redirect");
  return redirectPath;
}

function AuthPage({ navigate }) {
  const { isAuthenticated, isLoading, login, register, logout, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formStatus, setFormStatus] = useState("idle");

  const isRegister = mode === "register";
  const normalizedEmail = email.trim();
  const canSubmit =
    normalizedEmail.length > 0 &&
    password.length >= 8 &&
    (!isRegister || displayName.trim().length > 0) &&
    !isLoading &&
    formStatus !== "loading";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setFormStatus("error");
      setFormMessage("入力内容を確認してください。パスワードは8文字以上です。");
      return;
    }

    setFormStatus("loading");
    setFormMessage("");

    try {
      if (isRegister) {
        await register({ displayName, email: normalizedEmail, password });
      } else {
        await login({ email: normalizedEmail, password });
      }

      setFormStatus("success");
      setFormMessage(isRegister ? "登録しました。" : "ログインしました。");
      navigate(getRedirectPath());
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error.message || "認証に失敗しました。");
    }
  };

  const handleLogout = async () => {
    setFormStatus("loading");
    await logout();
    setFormStatus("success");
    setFormMessage("ログアウトしました。");
  };

  if (isAuthenticated) {
    return (
      <div className="page-stack">
        <AppHeader title="アカウント" subtitle="ログイン状態を確認できます" />

        <section className="profile-panel">
          <div className="profile-avatar" aria-hidden="true">
            {user.displayName?.slice(0, 1).toUpperCase() || "O"}
          </div>
          <div>
            <p className="panel-eyebrow">Logged in</p>
            <h2>{user.displayName}</h2>
            <p>{user.email}</p>
          </div>
        </section>

        <section className="auth-panel">
          <button className="primary-button" type="button" onClick={() => navigate("/post")}>
            このアカウントで投稿する
          </button>
          <button className="wide-soft-button" type="button" onClick={handleLogout} disabled={formStatus === "loading"}>
            ログアウト
          </button>
          {formMessage ? (
            <p className={formStatus === "error" ? "error-note" : "success-note"}>{formMessage}</p>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <AppHeader title={isRegister ? "新規登録" : "ログイン"} subtitle="自分の一曲を、自分の記録として残す" />

      <section className="auth-panel">
        <div className="auth-mode-control" role="group" aria-label="認証モード">
          <button
            className={!isRegister ? "is-active" : ""}
            type="button"
            onClick={() => {
              setMode("login");
              setFormMessage("");
            }}
          >
            <LogIn size={16} aria-hidden="true" />
            ログイン
          </button>
          <button
            className={isRegister ? "is-active" : ""}
            type="button"
            onClick={() => {
              setMode("register");
              setFormMessage("");
            }}
          >
            <UserPlus size={16} aria-hidden="true" />
            新規登録
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="auth-field">
              <span>表示名</span>
              <input
                type="text"
                value={displayName}
                autoComplete="name"
                maxLength="40"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="oto_user"
              />
            </label>
          ) : null}

          <label className="auth-field">
            <span>メールアドレス</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-field">
            <span>パスワード</span>
            <div className="password-control">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete={isRegister ? "new-password" : "current-password"}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8文字以上"
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </label>

          <button className="primary-button" type="submit" disabled={!canSubmit}>
            {formStatus === "loading" ? "送信中" : isRegister ? "登録して始める" : "ログイン"}
          </button>
        </form>

        {formMessage ? (
          <p className={formStatus === "error" ? "error-note" : "success-note"}>{formMessage}</p>
        ) : null}
        <p className="helper-text">
          投稿するときだけログインが必要です。地図、検索、アーカイブは未ログインでも見られます。
        </p>
      </section>
    </div>
  );
}

export default AuthPage;
