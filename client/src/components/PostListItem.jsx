import { ExternalLink, MapPin, Play } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";
import { formatTime } from "../utils/format.js";

function PostListItem({ post }) {
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
            {post.place}
          </span>
        </div>
      </div>
      {post.track.previewUrl ? (
        <button className="round-action" type="button" aria-label="プレビュー">
          <Play size={18} aria-hidden="true" />
        </button>
      ) : (
        <a className="round-action" href={post.track.externalUrl} target="_blank" rel="noreferrer" aria-label="Apple Musicで開く">
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export default PostListItem;
