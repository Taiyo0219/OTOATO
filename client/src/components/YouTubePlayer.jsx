function YouTubePlayer({ videoId, title }) {
  if (!videoId) {
    return null;
  }

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;

  return (
    <div className="youtube-player">
      <iframe
        title={title || "YouTube player"}
        src={src}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

export default YouTubePlayer;
