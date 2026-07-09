import { useEffect, useState } from "react";
import { CalendarDays, UserPlus } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import PostListItem from "../components/PostListItem.jsx";
import UserCard from "../components/UserCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchUserProfile, followUser, unfollowUser } from "../services/apiClient.js";
import { getTodayDateInputValue } from "../utils/format.js";

function getUserIdFromPath(path) {
  return decodeURIComponent(path.split("/")[2] || "");
}

function UserProfilePage({ path, navigate }) {
  const { isAuthenticated } = useAuth();
  const userId = getUserIdFromPath(path);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setStatus("loading");
      setMessage("");

      try {
        const data = await fetchUserProfile(userId);

        if (!isActive) {
          return;
        }

        setProfile(data.user);
        setPosts(data.posts || []);
        setStatus("success");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage(error.message || "プロフィールを取得できませんでした。");
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const handleFollow = async () => {
    if (!profile) {
      return;
    }

    if (!isAuthenticated) {
      window.sessionStorage.setItem("otoato_auth_redirect", path);
      navigate("/auth");
      return;
    }

    setBusy(true);

    try {
      const updatedProfile = profile.relationship?.isFollowing ? await unfollowUser(profile.id) : await followUser(profile.id);
      setProfile(updatedProfile);
    } catch (error) {
      setMessage(error.message || "フォロー操作に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-stack">
      <AppHeader title="プロフィール" subtitle="その人が残した音の記憶" onSearch={() => navigate("/explore")} />

      {status === "loading" ? <p className="status-banner">プロフィールを読み込み中です</p> : null}
      {message ? <p className="status-banner">{message}</p> : null}

      {profile ? (
        <>
          <UserCard
            user={profile}
            onFollow={isAuthenticated ? handleFollow : undefined}
            onLogin={() => {
              window.sessionStorage.setItem("otoato_auth_redirect", path);
              navigate("/auth");
            }}
            busy={busy}
          />

          <section className="quick-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => navigate(`/users/${profile.id}/day-trace?date=${getTodayDateInputValue()}`)}
            >
              <CalendarDays size={18} aria-hidden="true" />
              音の足あとを見る
            </button>
            {!profile.relationship?.isSelf ? (
              <button className="wide-soft-button" type="button" onClick={handleFollow} disabled={busy}>
                <UserPlus size={18} aria-hidden="true" />
                {profile.relationship?.isFollowing ? "フォロー解除" : "フォローする"}
              </button>
            ) : null}
          </section>

          <section className="content-section">
            <div className="section-heading">
              <h2>見られる投稿</h2>
              <span>{posts.length} songs</span>
            </div>
            {posts.length ? (
              <div className="list-stack">
                {posts.map((post) => (
                  <PostListItem key={post.id} post={post} onOpenDetails={() => navigate(`/posts/${post.id}`)} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>今見られる投稿はまだありません。</p>
              </div>
            )}
          </section>
        </>
      ) : status === "error" ? (
        <div className="empty-state">
          <p>プロフィールが見つかりません。</p>
        </div>
      ) : null}
    </div>
  );
}

export default UserProfilePage;
