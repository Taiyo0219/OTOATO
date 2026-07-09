import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import PostListItem from "../components/PostListItem.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMyPosts } from "../services/apiClient.js";

function MyPage({ navigate }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      setStatus("idle");
      return;
    }

    let isActive = true;

    async function loadMyPosts() {
      setStatus("loading");
      setMessage("");

      try {
        const myPosts = await fetchMyPosts();

        if (!isActive) {
          return;
        }

        setPosts(myPosts);
        setStatus("success");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage(error.message || "自分の投稿を取得できませんでした。");
      }
    }

    loadMyPosts();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  const handleAuthNavigate = () => {
    window.sessionStorage.setItem("otoato_auth_redirect", "/mypage");
    navigate("/auth");
  };

  const handleLogout = async () => {
    await logout();
    setPosts([]);
  };

  if (isLoading) {
    return (
      <div className="page-stack">
        <AppHeader title="マイページ" subtitle="ログイン状態を確認しています" />
        <p className="status-banner">アカウント情報を読み込み中です</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-stack">
        <AppHeader title="マイページ" subtitle="自分が残した音の履歴" />

        <section className="auth-callout">
          <div>
            <p className="panel-eyebrow">Guest</p>
            <h2>ログインすると投稿履歴を見られます</h2>
            <p>地図、検索、アーカイブは未ログインでも利用できます。</p>
          </div>
          <button className="primary-button" type="button" onClick={handleAuthNavigate}>
            <LogIn size={18} aria-hidden="true" />
            ログイン / 新規登録
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <AppHeader title="マイページ" subtitle="自分が残した音の履歴" />

      <section className="profile-panel">
        <div className="profile-avatar" aria-hidden="true">
          {user.displayName?.slice(0, 1).toUpperCase() || "O"}
        </div>
        <div>
          <p className="panel-eyebrow">User</p>
          <h2>{user.displayName}</h2>
          <p>{user.email}</p>
        </div>
      </section>

      <button className="wide-soft-button" type="button" onClick={handleLogout}>
        <LogOut size={18} aria-hidden="true" />
        ログアウト
      </button>

      {status === "loading" ? <p className="status-banner">自分の投稿を読み込み中です</p> : null}
      {message ? <p className="status-banner">{message}</p> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>自分の投稿</h2>
          <span>{posts.length} songs</span>
        </div>
        {posts.length > 0 ? (
          <div className="list-stack">
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} onOpenDetails={() => navigate(`/posts/${post.id}`)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>自分の投稿はまだありません。</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyPage;
