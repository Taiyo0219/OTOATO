import { Check, ExternalLink, Play } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";

function TrackCard({ track, isSelected = false, onSelect, onPreview }) {
  return (
    <article className={`track-card${isSelected ? " is-selected" : ""}`}>
      <AlbumArtwork track={track} />
      <div className="track-card-body">
        <p className="track-title">{track.title}</p>
        <p className="track-meta">{track.artist}</p>
        <p className="track-album">{track.album}</p>
        <div className="track-actions">
          {track.previewUrl ? (
            <button className="soft-button" type="button" onClick={() => onPreview?.(track)}>
              <Play size={16} aria-hidden="true" />
              <span>プレビュー</span>
            </button>
          ) : (
            <a className="soft-button" href={track.externalUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              <span>Apple Music</span>
            </a>
          )}
          {onSelect ? (
            <button className="select-button" type="button" onClick={() => onSelect(track)}>
              <Check size={16} aria-hidden="true" />
              <span>{isSelected ? "選択中" : "選択"}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default TrackCard;
