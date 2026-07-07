import { ExternalLink, MapPin } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";
import { formatTime } from "../utils/format.js";

function MapBottomSheet({ post, onOpenDetails }) {
  if (!post) {
    return null;
  }

  return (
    <aside className="map-bottom-sheet" aria-label="選択中の投稿">
      <AlbumArtwork track={post.track} size="lg" />
      <div className="sheet-body">
        <p className="track-title">{post.track.title}</p>
        <p className="track-meta">{post.track.artist}</p>
        {post.comment ? <p className="sheet-comment">{post.comment}</p> : null}
        <div className="post-inline-meta">
          <span>{formatTime(post.createdAt)}</span>
          <span>
            <MapPin size={13} aria-hidden="true" />
            {post.distance || "投稿地点"}
          </span>
        </div>
        <div className="track-actions">
          {post.track.externalUrl ? (
            <a className="soft-button" href={post.track.externalUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              <span>YouTube</span>
            </a>
          ) : null}
          <button className="select-button" type="button" onClick={() => onOpenDetails?.(post)}>
            詳細を見る
          </button>
        </div>
      </div>
    </aside>
  );
}

export default MapBottomSheet;
