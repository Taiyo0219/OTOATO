import { getMutualFriendIds } from "./followUtils.js";

const publicOrLegacyConditions = [
  { visibility: "public" },
  { visibility: { $exists: false } },
  { visibility: null }
];

export async function buildVisiblePostQuery(currentUserId, extraCondition = {}) {
  const conditions = [...publicOrLegacyConditions];

  if (currentUserId) {
    const friendIds = await getMutualFriendIds(currentUserId);
    conditions.push({ userId: currentUserId });

    if (friendIds.length > 0) {
      conditions.push({
        visibility: "friends",
        userId: { $in: friendIds }
      });
    }
  }

  const visibilityCondition = { $or: conditions };

  if (Object.keys(extraCondition).length === 0) {
    return visibilityCondition;
  }

  return {
    $and: [
      extraCondition,
      visibilityCondition
    ]
  };
}

export async function canViewPost(post, currentUserId) {
  if (!post) {
    return false;
  }

  const visibility = post.visibility || "public";
  const authorId = post.userId ? String(post.userId._id || post.userId) : "";

  if (visibility === "public" || !authorId) {
    return true;
  }

  if (!currentUserId) {
    return false;
  }

  if (authorId === String(currentUserId)) {
    return true;
  }

  if (visibility !== "friends") {
    return false;
  }

  const friendIds = await getMutualFriendIds(currentUserId);
  return friendIds.some((friendId) => String(friendId) === authorId);
}
