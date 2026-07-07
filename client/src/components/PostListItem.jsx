import { ExternalLink, MapPin, Play } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";
import { formatTime } from "../utils/format.js";

function PostListItem({ post, onPreview }) {
  return (
    <article className="post-list-item">
      <AlbumArtwork track={post.track} size="sm" />
      <div className="post-list-body">
        <p className="track-title">{post.track.title}</p>
        <p className="track-meta">{post.track.artist}</p>
        <div className="post-inline-meta">
          <span>{formatTime(post.createdAt)}</span>
          <span>
            <MapPin size={13} aria-hidden="true" />
            {post.place || "投稿地点"}
          </span>
        </div>
      </div>
      {post.track.previewUrl && onPreview ? (
        <button className="round-action" type="button" aria-label="プレビュー" onClick={() => onPreview?.(post.track)}>
          <Play size={18} aria-hidden="true" />
        </button>
      ) : post.track.previewUrl ? (
        <a className="round-action" href={post.track.previewUrl} target="_blank" rel="noreferrer" aria-label="プレビューを開く">
          <Play size={18} aria-hidden="true" />
        </a>
      ) : (
        <a className="round-action" href={post.track.externalUrl} target="_blank" rel="noreferrer" aria-label="Apple Musicで開く">
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export default PostListItem;
