function normalizeTrack(track = {}) {
  const provider = track.provider || "youtube";
  const externalId = track.externalId || "";

  return {
    provider,
    externalId,
    title: track.title || "",
    artist: track.artist || "",
    album: track.album || "",
    artworkUrl: track.artworkUrl || "",
    previewUrl: track.previewUrl || "",
    externalUrl: track.externalUrl || (provider === "youtube" && externalId ? `https://www.youtube.com/watch?v=${externalId}` : "")
  };
}

export function serializePost(post) {
  const raw = typeof post.toObject === "function" ? post.toObject() : post;
  const [longitude, latitude] = raw.location?.coordinates || [];

  return {
    id: String(raw._id),
    track: normalizeTrack(raw.track),
    location: {
      latitude,
      longitude
    },
    visibility: raw.visibility,
    comment: raw.comment || "",
    createdAt: raw.createdAt,
    userId: raw.userId ? String(raw.userId) : null
  };
}
