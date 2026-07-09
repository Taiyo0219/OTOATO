import { ExternalLink, MapPin } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";
import { formatTime } from "../utils/format.js";

const visibilityLabels = {
  public: "公開",
  friends: "友達",
  private: "自分だけ"
};

function PostListItem({ post, onOpenDetails, showVisibility = false }) {
  return (
    <article className="post-list-item">
      <AlbumArtwork track={post.track} size="sm" />
      <div className="post-list-body">
        <p className="track-title">{post.track.title}</p>
        <p className="track-meta">{post.track.artist}</p>
        {showVisibility ? <span className="visibility-badge">{visibilityLabels[post.visibility] || "公開"}</span> : null}
        {post.comment ? <p className="post-comment">{post.comment}</p> : null}
        <div className="post-inline-meta">
          <span>{formatTime(post.createdAt)}</span>
          {post.author?.displayName ? <span>{post.author.displayName}</span> : null}
          <span>
            <MapPin size={13} aria-hidden="true" />
            {post.place || "投稿地点"}
          </span>
        </div>
      </div>
      {onOpenDetails ? (
        <button className="round-action" type="button" aria-label="詳細を見る" onClick={() => onOpenDetails(post)}>
          <ExternalLink size={18} aria-hidden="true" />
        </button>
      ) : (
        <a className="round-action" href={post.track.externalUrl} target="_blank" rel="noreferrer" aria-label="YouTubeで開く">
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export default PostListItem;
