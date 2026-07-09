export function serializeUser(user) {
  const raw = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: String(raw._id),
    displayName: raw.displayName || "",
    email: raw.email || "",
    createdAt: raw.createdAt
  };
}
