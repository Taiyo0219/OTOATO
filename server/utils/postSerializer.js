export function serializePost(post) {
  const raw = typeof post.toObject === "function" ? post.toObject() : post;
  const [longitude, latitude] = raw.location?.coordinates || [];

  return {
    id: String(raw._id),
    track: raw.track,
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
