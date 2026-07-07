import { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import PostListItem from "../components/PostListItem.jsx";
import { formatDateLabel } from "../utils/format.js";
import { mockArchivePosts } from "../utils/mockData.js";

const defaultDate = "2026-07-07";

function ArchivePage() {
  const [date, setDate] = useState(defaultDate);

  const posts = useMemo(() => {
    return mockArchivePosts.filter((post) => post.createdAt.startsWith(date));
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

      <section className="content-section">
        <div className="section-heading">
          <h2>{formatDateLabel(date)}</h2>
          <span>{posts.length} songs</span>
        </div>

        {posts.length > 0 ? (
          <div className="list-stack">
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} />
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
