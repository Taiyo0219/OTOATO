import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import AlbumArtwork from "../components/AlbumArtwork.jsx";
import LeafletMap from "../components/LeafletMap.jsx";
import TrackPreviewPanel from "../components/TrackPreviewPanel.jsx";
import { fetchUserDayTrace } from "../services/apiClient.js";
import { formatDateLabel, formatTime, getTodayDateInputValue } from "../utils/format.js";

function getUserIdFromPath(path) {
  return decodeURIComponent(path.split("/")[2] || "");
}

function getInitialDate() {
  const params = new URLSearchParams(window.location.search);
  return params.get("date") || getTodayDateInputValue();
}

function DayTracePage({ path, navigate }) {
  const userId = getUserIdFromPath(path);
  const [date, setDate] = useState(getInitialDate);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDayTrace() {
      setStatus("loading");
      setMessage("");

      try {
        const data = await fetchUserDayTrace({ userId, date });

        if (!isActive) {
          return;
        }

        setProfile(data.user);
        setPosts(data.posts || []);
        setSelectedPost(data.posts?.[0] || null);
        setStatus("success");
        window.history.replaceState({}, "", `/users/${userId}/day-trace?date=${date}`);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage(error.message || "音の足あとを取得できませんでした。");
      }
    }

    loadDayTrace();

    return () => {
      isActive = false;
    };
  }, [date, userId]);

  return (
    <div className="page-stack">
      <AppHeader title="音の足あと" subtitle="その日の曲を、地図と時系列でたどる" onProfile={() => navigate(`/users/${userId}`)} />

      <section className="search-panel">
        <label className="date-field">
          <span>日付</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </section>

      {status === "loading" ? <p className="status-banner">音の足あとを読み込み中です</p> : null}
      {message ? <p className="status-banner">{message}</p> : null}

      {profile ? (
        <section className="profile-strip">
          <div className="profile-avatar profile-avatar-xs" aria-hidden="true">
            {profile.displayName?.slice(0, 1).toUpperCase() || "O"}
          </div>
          <div>
            <p className="panel-eyebrow">{formatDateLabel(date)}</p>
            <h2>{profile.displayName}</h2>
          </div>
        </section>
      ) : null}

      <div className="post-map-preview">
        <LeafletMap
          posts={posts}
          selectedPostId={selectedPost?.id}
          onSelectPost={setSelectedPost}
          compact
          numbered
        />
      </div>
      <p className="helper-text">番号は投稿された順番です。実際の移動経路を記録・推定するものではありません。</p>

      {selectedPost ? <TrackPreviewPanel track={selectedPost.track} /> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>時系列</h2>
          <span>{posts.length} songs</span>
        </div>

        {posts.length ? (
          <div className="timeline-list">
            {posts.map((post, index) => (
              <button
                key={post.id}
                className={`timeline-item${selectedPost?.id === post.id ? " is-active" : ""}`}
                type="button"
                onClick={() => setSelectedPost(post)}
              >
                <span className="timeline-index">{index + 1}</span>
                <AlbumArtwork track={post.track} size="sm" />
                <span className="timeline-copy">
                  <span className="timeline-time">{formatTime(post.createdAt)}</span>
                  <strong>{post.track.title}</strong>
                  <span>{post.track.artist}</span>
                  {post.comment ? <small>{post.comment}</small> : null}
                  <span className="post-inline-meta">
                    <span>
                      <MapPin size={13} aria-hidden="true" />
                      {post.location?.latitude?.toFixed(5)}, {post.location?.longitude?.toFixed(5)}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>この日はまだ音の足あとがありません。別の日を選んでみてください。</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default DayTracePage;
