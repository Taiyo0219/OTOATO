import { Check } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";

function TrackCard({ track, isSelected = false, onSelect }) {
  return (
    <article className={`track-card${isSelected ? " is-selected" : ""}`}>
      <AlbumArtwork track={track} />
      <div className="track-card-body">
        <p className="track-title">{track.title}</p>
        <p className="track-meta">{track.artist}</p>
        {track.album ? <p className="track-album">{track.album}</p> : null}
        <div className="track-actions">
          {onSelect ? (
            <button className="select-button" type="button" onClick={() => onSelect(track)}>
              <Check size={16} aria-hidden="true" />
              <span>{isSelected ? "選択中" : "この曲を選ぶ"}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default TrackCard;
