import mongoose from "mongoose";
import { isDatabaseConnected } from "../config/database.js";
import { Follow } from "../models/Follow.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { createValidationError, dateRangeForJstDate } from "../utils/dateRange.js";
import { getFollowCounts, getRelationship } from "../utils/followUtils.js";
import { serializePost } from "../utils/postSerializer.js";
import { serializePublicUser, serializeUser } from "../utils/userSerializer.js";
import { buildVisiblePostQuery } from "../utils/visibility.js";

function assertDatabaseConnection() {
  if (!isDatabaseConnected()) {
    const error = new Error("MongoDBに接続されていないため、ユーザーデータを利用できません。");
    error.status = 503;
    throw error;
  }
}

function assertObjectId(id, message = "ユーザーが見つかりません。") {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(message);
    error.status = 404;
    throw error;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeFavoriteGenres(value) {
  const rawGenres = Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((genre) => genre.trim());
  const uniqueGenres = [];

  for (const rawGenre of rawGenres) {
    const genre = String(rawGenre || "").trim();

    if (!genre || uniqueGenres.includes(genre)) {
      continue;
    }

    if (genre.length > 24) {
      throw createValidationError("好きなジャンルは各24文字以内で入力してください。");
    }

    uniqueGenres.push(genre);
  }

  if (uniqueGenres.length > 8) {
    throw createValidationError("好きなジャンルは8個以内で入力してください。");
  }

  return uniqueGenres;
}

function validateProfilePayload(body) {
  const displayName = String(body.displayName || "").trim();
  const bio = String(body.bio || "").trim();
  const favoriteGenres = normalizeFavoriteGenres(body.favoriteGenres);

  if (!displayName) {
    throw createValidationError("表示名は必須です。");
  }

  if (displayName.length > 40) {
    throw createValidationError("表示名は40文字以内で入力してください。");
  }

  if (bio.length > 160) {
    throw createValidationError("bioは160文字以内で入力してください。");
  }

  return { displayName, bio, favoriteGenres };
}

async function findUserOr404(userId) {
  assertObjectId(userId);
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("ユーザーが見つかりません。");
    error.status = 404;
    throw error;
  }

  return user;
}

async function buildPublicProfile(user, currentUserId) {
  const [counts, relationship] = await Promise.all([
    getFollowCounts(user._id),
    getRelationship(currentUserId, user._id)
  ]);

  return serializePublicUser(user, {
    ...counts,
    relationship
  });
}

async function findVisiblePostsForUser({ targetUserId, currentUserId, date, limit = 100, sort = { createdAt: -1 } }) {
  const authorCondition = { userId: targetUserId };
  const dateCondition = {};

  if (date) {
    const { start, end } = dateRangeForJstDate(date);
    dateCondition.createdAt = {
      $gte: start,
      $lt: end
    };
  }

  const query = await buildVisiblePostQuery(currentUserId, {
    ...authorCondition,
    ...dateCondition
  });

  return Post.find(query)
    .populate("userId", "displayName")
    .sort(sort)
    .limit(limit);
}

export async function getMyProfile(req, res, next) {
  try {
    assertDatabaseConnection();
    const counts = await getFollowCounts(req.user.id);

    res.json({
      user: {
        ...serializeUser(req.userDocument),
        ...counts
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    assertDatabaseConnection();
    const payload = validateProfilePayload(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, payload, {
      new: true,
      runValidators: true
    });
    const counts = await getFollowCounts(req.user.id);

    res.json({
      user: {
        ...serializeUser(user),
        ...counts
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function searchUsers(req, res, next) {
  try {
    assertDatabaseConnection();
    const query = String(req.query.q || "").trim();

    if (!query) {
      res.json({ users: [] });
      return;
    }

    if (query.length > 40) {
      throw createValidationError("検索文字は40文字以内で入力してください。");
    }

    const pattern = new RegExp(escapeRegExp(query), "i");
    const users = await User.find({ displayName: pattern })
      .sort({ updatedAt: -1 })
      .limit(20);
    const serializedUsers = await Promise.all(users.map((user) => buildPublicProfile(user, req.user?.id)));

    res.json({ users: serializedUsers });
  } catch (error) {
    next(error);
  }
}

export async function getUserProfile(req, res, next) {
  try {
    assertDatabaseConnection();
    const user = await findUserOr404(req.params.userId);
    const [profile, posts] = await Promise.all([
      buildPublicProfile(user, req.user?.id),
      findVisiblePostsForUser({
        targetUserId: user._id,
        currentUserId: req.user?.id,
        limit: 30
      })
    ]);

    res.json({
      user: profile,
      posts: posts.map(serializePost)
    });
  } catch (error) {
    next(error);
  }
}

export async function followUser(req, res, next) {
  try {
    assertDatabaseConnection();
    const targetUser = await findUserOr404(req.params.userId);

    if (String(targetUser._id) === req.user.id) {
      throw createValidationError("自分自身はフォローできません。");
    }

    try {
      await Follow.create({
        followerId: req.user.id,
        followingId: targetUser._id
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }

    const profile = await buildPublicProfile(targetUser, req.user.id);
    res.status(201).json({ user: profile });
  } catch (error) {
    next(error);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    assertDatabaseConnection();
    const targetUser = await findUserOr404(req.params.userId);

    if (String(targetUser._id) === req.user.id) {
      throw createValidationError("自分自身のフォローは解除できません。");
    }

    await Follow.deleteOne({
      followerId: req.user.id,
      followingId: targetUser._id
    });

    const profile = await buildPublicProfile(targetUser, req.user.id);
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
}

export async function getFollowers(req, res, next) {
  try {
    assertDatabaseConnection();
    await findUserOr404(req.params.userId);
    const follows = await Follow.find({ followingId: req.params.userId })
      .populate("followerId")
      .sort({ createdAt: -1 })
      .limit(100);
    const users = await Promise.all(
      follows
        .map((follow) => follow.followerId)
        .filter(Boolean)
        .map((user) => buildPublicProfile(user, req.user?.id))
    );

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getFollowing(req, res, next) {
  try {
    assertDatabaseConnection();
    await findUserOr404(req.params.userId);
    const follows = await Follow.find({ followerId: req.params.userId })
      .populate("followingId")
      .sort({ createdAt: -1 })
      .limit(100);
    const users = await Promise.all(
      follows
        .map((follow) => follow.followingId)
        .filter(Boolean)
        .map((user) => buildPublicProfile(user, req.user?.id))
    );

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getUserPosts(req, res, next) {
  try {
    assertDatabaseConnection();
    const user = await findUserOr404(req.params.userId);
    const date = req.query.date ? String(req.query.date) : "";
    const posts = await findVisiblePostsForUser({
      targetUserId: user._id,
      currentUserId: req.user?.id,
      date,
      limit: 100
    });

    res.json({ posts: posts.map(serializePost) });
  } catch (error) {
    next(error);
  }
}

export async function getUserDayTrace(req, res, next) {
  try {
    assertDatabaseConnection();
    const user = await findUserOr404(req.params.userId);
    const date = String(req.query.date || "");
    const [profile, posts] = await Promise.all([
      buildPublicProfile(user, req.user?.id),
      findVisiblePostsForUser({
        targetUserId: user._id,
        currentUserId: req.user?.id,
        date,
        limit: 100,
        sort: { createdAt: 1 }
      })
    ]);

    res.json({
      date,
      user: profile,
      posts: posts.map(serializePost)
    });
  } catch (error) {
    next(error);
  }
}
