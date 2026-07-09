import { Follow } from "../models/Follow.js";

function toIdString(value) {
  if (!value) {
    return "";
  }

  return String(value._id || value);
}

export async function getFollowCounts(userId) {
  const [followerCount, followingCount] = await Promise.all([
    Follow.countDocuments({ followingId: userId }),
    Follow.countDocuments({ followerId: userId })
  ]);

  return { followerCount, followingCount };
}

export async function getRelationship(currentUserId, targetUserId) {
  const current = toIdString(currentUserId);
  const target = toIdString(targetUserId);

  if (!current) {
    return {
      isSelf: false,
      isFollowing: false,
      isFollowedBy: false,
      isFriend: false
    };
  }

  if (current === target) {
    return {
      isSelf: true,
      isFollowing: false,
      isFollowedBy: false,
      isFriend: false
    };
  }

  const [following, followedBy] = await Promise.all([
    Follow.exists({ followerId: current, followingId: target }),
    Follow.exists({ followerId: target, followingId: current })
  ]);
  const isFollowing = Boolean(following);
  const isFollowedBy = Boolean(followedBy);

  return {
    isSelf: false,
    isFollowing,
    isFollowedBy,
    isFriend: isFollowing && isFollowedBy
  };
}

export async function getMutualFriendIds(userId) {
  if (!userId) {
    return [];
  }

  const following = await Follow.find({ followerId: userId }).select("followingId").lean();
  const followingIds = following.map((follow) => follow.followingId);

  if (followingIds.length === 0) {
    return [];
  }

  const mutualFollows = await Follow.find({
    followerId: { $in: followingIds },
    followingId: userId
  })
    .select("followerId")
    .lean();

  return mutualFollows.map((follow) => follow.followerId);
}
