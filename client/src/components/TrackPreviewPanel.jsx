import { ExternalLink } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";
import YouTubePlayer from "./YouTubePlayer.jsx";

function TrackPreviewPanel({ track }) {
  if (!track) {
    return null;
  }

  const isYouTube = (track.provider || "youtube") === "youtube";

  return (
    <section className="preview-panel">
      <div className="section-heading">
        <h2>動画を確認する</h2>
        <span>{isYouTube ? "YouTube" : "link"}</span>
      </div>

      {isYouTube ? (
        <YouTubePlayer videoId={track.externalId} title={track.title} />
      ) : (
        <div className="preview-body">
          <AlbumArtwork track={track} size="sm" />
          <div className="preview-copy">
            <p className="track-title">{track.title}</p>
            <p className="track-meta">{track.artist}</p>
          </div>
        </div>
      )}

      {track.externalUrl ? (
        <a className="wide-soft-button" href={track.externalUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={18} aria-hidden="true" />
          <span>YouTubeで開く</span>
        </a>
      ) : null}
    </section>
  );
}

export default TrackPreviewPanel;
