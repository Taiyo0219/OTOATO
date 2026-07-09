import { useEffect, useState } from "react";
import { LogIn, LogOut, Save, Settings2 } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import PostListItem from "../components/PostListItem.jsx";
import UserCard from "../components/UserCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchFollowers,
  fetchFollowing,
  fetchMyPosts,
  fetchMyProfile,
  followUser,
  unfollowUser,
  updateMyProfile
} from "../services/apiClient.js";

function genresToText(genres = []) {
  return genres.join(", ");
}

function MyPage({ navigate }) {
  const { isAuthenticated, isLoading, logout, setCurrentUser, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", bio: "", favoriteGenres: "" });
  const [busyUserId, setBusyUserId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setPosts([]);
      setFollowers([]);
      setFollowing([]);
      setStatus("idle");
      return;
    }

    let isActive = true;

    async function loadMyPage() {
      setStatus("loading");
      setMessage("");

      try {
        const [myProfile, myPosts] = await Promise.all([
          fetchMyProfile(),
          fetchMyPosts()
        ]);
        const [followerUsers, followingUsers] = await Promise.all([
          fetchFollowers(myProfile.id),
          fetchFollowing(myProfile.id)
        ]);

        if (!isActive) {
          return;
        }

        setProfile(myProfile);
        setPosts(myPosts);
        setFollowers(followerUsers);
        setFollowing(followingUsers);
        setForm({
          displayName: myProfile.displayName || "",
          bio: myProfile.bio || "",
          favoriteGenres: genresToText(myProfile.favoriteGenres)
        });
        setStatus("success");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage(error.message || "マイページを取得できませんでした。");
      }
    }

    loadMyPage();

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
    setProfile(null);
    setPosts([]);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const updatedProfile = await updateMyProfile({
        displayName: form.displayName,
        bio: form.bio,
        favoriteGenres: form.favoriteGenres
      });

      setProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      setForm({
        displayName: updatedProfile.displayName || "",
        bio: updatedProfile.bio || "",
        favoriteGenres: genresToText(updatedProfile.favoriteGenres)
      });
      setIsEditing(false);
      setStatus("success");
      setMessage("プロフィールを更新しました。");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "プロフィールを更新できませんでした。");
    }
  };

  const handleFollow = async (targetUser) => {
    setBusyUserId(targetUser.id);

    try {
      const updatedUser = targetUser.relationship?.isFollowing
        ? await unfollowUser(targetUser.id)
        : await followUser(targetUser.id);
      const updateList = (users) => users.map((item) => (item.id === updatedUser.id ? updatedUser : item));
      setFollowers(updateList);
      setFollowing(updateList);
    } catch (error) {
      setMessage(error.message || "フォロー操作に失敗しました。");
    } finally {
      setBusyUserId("");
    }
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
            <p>プロフィール、フォロー、友達限定投稿はログイン後に使えます。</p>
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
      <AppHeader title="マイページ" subtitle="自分が残した音の履歴" onSearch={() => navigate("/explore")} />

      {profile ? (
        <section className="profile-panel">
          <div className="profile-avatar" aria-hidden="true">
            {profile.displayName?.slice(0, 1).toUpperCase() || "O"}
          </div>
          <div>
            <p className="panel-eyebrow">User</p>
            <h2>{profile.displayName}</h2>
            <p>{profile.bio || profile.email}</p>
            {profile.favoriteGenres?.length ? (
              <div className="genre-list">
                {profile.favoriteGenres.map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
            ) : null}
            <div className="post-inline-meta">
              <span>{profile.followerCount || 0} followers</span>
              <span>{profile.followingCount || 0} following</span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="quick-actions">
        <button className="wide-soft-button" type="button" onClick={() => setIsEditing((value) => !value)}>
          <Settings2 size={18} aria-hidden="true" />
          プロフィール編集
        </button>
        <button className="wide-soft-button" type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          ログアウト
        </button>
      </section>

      {isEditing ? (
        <form className="auth-panel" onSubmit={handleProfileSave}>
          <label className="auth-field">
            <span>表示名</span>
            <input
              type="text"
              value={form.displayName}
              maxLength="40"
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            />
          </label>
          <label className="auth-field">
            <span>プロフィール文</span>
            <textarea
              className="profile-textarea"
              value={form.bio}
              maxLength="160"
              rows="4"
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder="どんな音楽が好きですか？"
            />
          </label>
          <label className="auth-field">
            <span>好きなジャンル</span>
            <input
              type="text"
              value={form.favoriteGenres}
              onChange={(event) => setForm((current) => ({ ...current, favoriteGenres: event.target.value }))}
              placeholder="Rock, Vocaloid, Anime"
            />
          </label>
          <button className="primary-button" type="submit" disabled={status === "saving"}>
            <Save size={18} aria-hidden="true" />
            {status === "saving" ? "保存中" : "保存する"}
          </button>
        </form>
      ) : null}

      {status === "loading" ? <p className="status-banner">マイページを読み込み中です</p> : null}
      {message ? <p className={status === "error" ? "error-note" : "status-banner"}>{message}</p> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>フォロー中</h2>
          <span>{following.length} people</span>
        </div>
        {following.length ? (
          <div className="list-stack">
            {following.map((targetUser) => (
              <UserCard
                key={targetUser.id}
                user={targetUser}
                compact
                onOpen={() => navigate(`/users/${targetUser.id}`)}
                onFollow={handleFollow}
                busy={busyUserId === targetUser.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>まだ誰もフォローしていません。「探す」から気になる人を見つけられます。</p>
          </div>
        )}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>フォロワー</h2>
          <span>{followers.length} people</span>
        </div>
        {followers.length ? (
          <div className="list-stack">
            {followers.map((targetUser) => (
              <UserCard
                key={targetUser.id}
                user={targetUser}
                compact
                onOpen={() => navigate(`/users/${targetUser.id}`)}
                onFollow={handleFollow}
                busy={busyUserId === targetUser.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>フォロワーはまだいません。</p>
          </div>
        )}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>自分の投稿</h2>
          <span>{posts.length} songs</span>
        </div>
        {posts.length > 0 ? (
          <div className="list-stack">
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} onOpenDetails={() => navigate(`/posts/${post.id}`)} showVisibility />
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
