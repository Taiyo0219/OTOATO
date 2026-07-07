import { useEffect, useId, useRef } from "react";
import { ExternalLink, Music2 } from "lucide-react";
import AlbumArtwork from "./AlbumArtwork.jsx";

function TrackPreviewPanel({ track }) {
  const audioId = useId();
  const audioRef = useRef(null);

  useEffect(() => {
    const handleOtherAudioPlay = (event) => {
      if (event.detail !== audioId) {
        audioRef.current?.pause();
      }
    };

    window.addEventListener("otoato-audio-play", handleOtherAudioPlay);

    return () => {
      audioRef.current?.pause();
      window.removeEventListener("otoato-audio-play", handleOtherAudioPlay);
    };
  }, [audioId]);

  if (!track) {
    return null;
  }

  return (
    <section className="preview-panel">
      <div className="section-heading">
        <h2>プレビュー</h2>
        <span>{track.previewUrl ? "audio" : "link"}</span>
      </div>
      <div className="preview-body">
        <AlbumArtwork track={track} size="sm" />
        <div className="preview-copy">
          <p className="track-title">{track.title}</p>
          <p className="track-meta">{track.artist}</p>
          {track.previewUrl ? (
            <audio
              key={track.externalId}
              ref={audioRef}
              controls
              preload="none"
              src={track.previewUrl}
              onPlay={() => window.dispatchEvent(new CustomEvent("otoato-audio-play", { detail: audioId }))}
            />
          ) : (
            <div className="fallback-preview">
              <Music2 size={16} aria-hidden="true" />
              <span>プレビューは提供されていません</span>
            </div>
          )}
        </div>
      </div>
      {!track.previewUrl ? (
        <a className="wide-soft-button" href={track.externalUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={18} aria-hidden="true" />
          <span>Apple Musicで開く</span>
        </a>
      ) : null}
    </section>
  );
}

export default TrackPreviewPanel;
