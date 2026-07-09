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
  const userRef = raw.userId;
  const hasPopulatedUser = userRef && typeof userRef === "object" && userRef._id;
  const userId = hasPopulatedUser ? String(userRef._id) : userRef ? String(userRef) : null;

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
    userId,
    author: hasPopulatedUser
      ? {
          id: userId,
          displayName: userRef.displayName || "匿名ユーザー"
        }
      : null
  };
}
