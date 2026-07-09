import { useState } from "react";
import { Search } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import UserCard from "../components/UserCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { followUser, searchUsers, unfollowUser } from "../services/apiClient.js";

function ExplorePage({ navigate }) {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("気になる人の表示名を検索できます。");
  const [busyUserId, setBusyUserId] = useState("");

  const handleSearch = async (event) => {
    event?.preventDefault();
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setUsers([]);
      setStatus("idle");
      setMessage("検索文字を入力してください。");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await searchUsers(normalizedQuery);
      setUsers(result);
      setStatus("success");
      setMessage(result.length ? "" : "該当するユーザーが見つかりません。");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "ユーザー検索に失敗しました。");
    }
  };

  const handleFollow = async (user) => {
    if (!isAuthenticated) {
      window.sessionStorage.setItem("otoato_auth_redirect", "/explore");
      navigate("/auth");
      return;
    }

    setBusyUserId(user.id);

    try {
      const updatedUser = user.relationship?.isFollowing ? await unfollowUser(user.id) : await followUser(user.id);
      setUsers((currentUsers) => currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
    } catch (error) {
      setMessage(error.message || "フォロー操作に失敗しました。");
      setStatus("error");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <div className="page-stack">
      <AppHeader title="探す" subtitle="音楽の記憶をたどりたい人を見つける" />

      <form className="search-panel" onSubmit={handleSearch}>
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="表示名で検索"
          />
        </label>
        <button className="primary-button" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "検索中..." : "検索"}
        </button>
      </form>

      {message ? <p className="status-banner">{message}</p> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>ユーザー</h2>
          <span>{users.length} people</span>
        </div>

        {users.length ? (
          <div className="list-stack">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onOpen={() => navigate(`/users/${user.id}`)}
                onFollow={isAuthenticated ? handleFollow : undefined}
                onLogin={() => {
                  window.sessionStorage.setItem("otoato_auth_redirect", "/explore");
                  navigate("/auth");
                }}
                busy={busyUserId === user.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>表示名で検索すると、プロフィールとフォロー状態が表示されます。</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ExplorePage;
