import { ExternalLink, MapPin, Play } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";
import { formatTime } from "../utils/format.js";

function MapBottomSheet({ post }) {
  if (!post) {
    return null;
  }

  return (
    <aside className="map-bottom-sheet" aria-label="選択中の投稿">
      <AlbumArtwork track={post.track} size="lg" />
      <div className="sheet-body">
        <p className="track-title">{post.track.title}</p>
        <p className="track-meta">{post.track.artist}</p>
        <div className="post-inline-meta">
          <span>{formatTime(post.createdAt)}</span>
          <span>
            <MapPin size={13} aria-hidden="true" />
            {post.distance}
          </span>
        </div>
        <div className="track-actions">
          {post.track.previewUrl ? (
            <button className="soft-button" type="button">
              <Play size={16} aria-hidden="true" />
              <span>再生</span>
            </button>
          ) : (
            <a className="soft-button" href={post.track.externalUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              <span>Apple Music</span>
            </a>
          )}
          <button className="select-button" type="button">
            詳細を見る
          </button>
        </div>
      </div>
    </aside>
  );
}

export default MapBottomSheet;
