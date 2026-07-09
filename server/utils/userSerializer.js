export function serializeUser(user) {
  const raw = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: String(raw._id),
    displayName: raw.displayName || "",
    email: raw.email || "",
    bio: raw.bio || "",
    favoriteGenres: raw.favoriteGenres || [],
    createdAt: raw.createdAt
  };
}

export function serializePublicUser(user, extras = {}) {
  const raw = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: String(raw._id),
    displayName: raw.displayName || "",
    bio: raw.bio || "",
    favoriteGenres: raw.favoriteGenres || [],
    createdAt: raw.createdAt,
    followerCount: extras.followerCount ?? 0,
    followingCount: extras.followingCount ?? 0,
    relationship: extras.relationship || {
      isSelf: false,
      isFollowing: false,
      isFollowedBy: false,
      isFriend: false
    }
  };
}
