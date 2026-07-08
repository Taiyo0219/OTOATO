import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import PostListItem from "../components/PostListItem.jsx";
import { fetchArchivePosts } from "../services/apiClient.js";
import { formatDateLabel, getTodayDateInputValue } from "../utils/format.js";

const defaultDate = getTodayDateInputValue();

function ArchivePage({ navigate }) {
  const [date, setDate] = useState(defaultDate);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadArchivePosts() {
      setStatus("loading");
      const result = await fetchArchivePosts(date);

      if (!isActive) {
        return;
      }

      setPosts(result.posts);
      setMessage(result.message);
      setStatus(result.source === "api" ? "success" : "mock");
    }

    loadArchivePosts();

    return () => {
      isActive = false;
    };
  }, [date]);

  return (
    <div className="page-stack">
      <AppHeader title="アーカイブ" subtitle="日付から、その日の音を探す" />

      <section className="search-panel">
        <label className="date-field">
          <span>日付</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </section>

      {status === "loading" ? <p className="status-banner">アーカイブを検索中です</p> : null}
      {message ? <p className="status-banner">{message}</p> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>{formatDateLabel(date)}</h2>
          <span>{posts.length} videos</span>
        </div>

        {posts.length > 0 ? (
          <div className="list-stack">
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} onOpenDetails={() => navigate(`/posts/${post.id}`)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>この日の投稿はまだありません。</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ArchivePage;
