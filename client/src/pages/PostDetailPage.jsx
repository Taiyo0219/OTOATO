import { useEffect, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import LeafletMap from "../components/LeafletMap.jsx";
import TrackPreviewPanel from "../components/TrackPreviewPanel.jsx";
import { fetchPostById } from "../services/apiClient.js";
import { formatTime } from "../utils/format.js";

function PostDetailPage({ path, navigate }) {
  const postId = decodeURIComponent(path.split("/").pop() || "");
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPost() {
      setStatus("loading");
      const result = await fetchPostById(postId);

      if (!isActive) {
        return;
      }

      setPost(result.post);
      setMessage(result.message);
      setStatus(result.post ? "success" : "error");
    }

    loadPost();

    return () => {
      isActive = false;
    };
  }, [postId]);

  return (
    <div className="page-stack">
      <AppHeader title="投稿詳細" subtitle="この場所に残された動画" onSearch={() => navigate("/post")} />

      {status === "loading" ? <p className="status-banner">投稿を読み込み中です</p> : null}
      {message ? <p className="status-banner">{message}</p> : null}

      {post ? (
        <>
          <TrackPreviewPanel track={post.track} />

          <section className="confirmation-panel">
            <div className="section-heading">
              <h2>{post.track.title}</h2>
              <span>{formatTime(post.createdAt)}</span>
            </div>
            <p className="track-meta">{post.track.artist}</p>
            {post.comment ? <p className="detail-comment">{post.comment}</p> : null}
            <div className="post-inline-meta">
              <span>
                <MapPin size={13} aria-hidden="true" />
                {post.location?.latitude?.toFixed(5)}, {post.location?.longitude?.toFixed(5)}
              </span>
            </div>
            {post.track.externalUrl ? (
              <a className="wide-soft-button" href={post.track.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={18} aria-hidden="true" />
                <span>YouTubeで開く</span>
              </a>
            ) : null}
          </section>

          <div className="post-map-preview">
            <LeafletMap selectedLocation={post.location} compact />
          </div>
        </>
      ) : status === "error" ? (
        <div className="empty-state">
          <p>投稿が見つかりません。</p>
        </div>
      ) : null}
    </div>
  );
}

export default PostDetailPage;
