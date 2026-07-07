function AlbumArtwork({ track, size = "md" }) {
  return (
    <div className={`album-artwork album-artwork-${size}`} style={{ background: track.color }}>
      {track.artworkUrl ? <img src={track.artworkUrl} alt={`${track.title}のジャケット`} loading="lazy" /> : null}
    </div>
  );
}

export default AlbumArtwork;
