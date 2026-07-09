import { isDatabaseConnected } from "../config/database.js";
import { Post } from "../models/Post.js";
import { createValidationError, dateRangeForJstDate } from "../utils/dateRange.js";
import { serializePost } from "../utils/postSerializer.js";
import { buildVisiblePostQuery } from "../utils/visibility.js";
import mongoose from "mongoose";

const visibilityValues = new Set(["private", "friends", "public"]);

function assertDatabaseConnection() {
  if (!isDatabaseConnected()) {
    const error = new Error("MongoDBに接続されていないため、投稿データを利用できません。");
    error.status = 503;
    throw error;
  }
}

function parseCoordinate(value) {
  if (value === undefined || value === null || value === "") {
    return Number.NaN;
  }

  return Number(value);
}

function validatePostPayload(body) {
  const track = body.track || {};
  const externalId = String(track.externalId || "").trim();
  const title = String(track.title || "").trim();
  const artist = String(track.artist || "").trim();
  const latitude = parseCoordinate(body.latitude);
  const longitude = parseCoordinate(body.longitude);
  const visibility = String(body.visibility || "public");
  const comment = String(body.comment || "");

  if (!title) {
    throw createValidationError("楽曲タイトルは必須です。");
  }

  if (!artist) {
    throw createValidationError("アーティスト名は必須です。");
  }

  if (!externalId) {
    throw createValidationError("動画IDは必須です。");
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw createValidationError("latitudeは-90〜90の範囲で指定してください。");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw createValidationError("longitudeは-180〜180の範囲で指定してください。");
  }

  if (!visibilityValues.has(visibility)) {
    throw createValidationError("visibilityはprivate、friends、publicのいずれかを指定してください。");
  }

  if (comment.length > 80) {
    throw createValidationError("commentは80文字以内で入力してください。");
  }

  return {
    track: {
      provider: String(track.provider || "youtube"),
      externalId,
      title,
      artist,
      album: String(track.album || ""),
      artworkUrl: String(track.artworkUrl || ""),
      previewUrl: String(track.previewUrl || ""),
      externalUrl: String(track.externalUrl || "")
    },
    latitude,
    longitude,
    visibility,
    comment
  };
}

function logDevelopment(message, value) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.log(`${message}: ${value}`);
}

export async function createPost(req, res, next) {
  try {
    const payload = validatePostPayload(req.body);
    assertDatabaseConnection();

    const post = await Post.create({
      track: payload.track,
      location: {
        type: "Point",
        coordinates: [payload.longitude, payload.latitude]
      },
      visibility: payload.visibility,
      comment: payload.comment,
      userId: req.user.id
    });

    logDevelopment("Saved post createdAt", post.createdAt.toISOString());

    res.status(201).json({ post: serializePost(post) });
  } catch (error) {
    next(error);
  }
}

export async function getNearbyPosts(req, res, next) {
  try {
    const latitude = parseCoordinate(req.query.lat);
    const longitude = parseCoordinate(req.query.lng);
    const radius = parseCoordinate(req.query.radius || 1000);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw createValidationError("latは-90〜90の範囲で指定してください。");
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw createValidationError("lngは-180〜180の範囲で指定してください。");
    }

    if (!Number.isFinite(radius) || radius <= 0 || radius > 10000) {
      throw createValidationError("radiusは1〜10000mの範囲で指定してください。");
    }

    assertDatabaseConnection();
    const query = await buildVisiblePostQuery(req.user?.id, {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      }
    });

    const posts = await Post.find(query)
      .populate("userId", "displayName")
      .limit(50);

    res.json({ posts: posts.map(serializePost) });
  } catch (error) {
    next(error);
  }
}

export async function getArchivePosts(req, res, next) {
  try {
    const date = String(req.query.date || "");
    const { start, end } = dateRangeForJstDate(date);
    assertDatabaseConnection();
    const query = await buildVisiblePostQuery(req.user?.id, {
      createdAt: {
        $gte: start,
        $lt: end
      }
    });

    const posts = await Post.find(query)
      .populate("userId", "displayName")
      .sort({ createdAt: -1 })
      .limit(100);

    logDevelopment("Archive requested date", date);
    logDevelopment("Archive range start", start.toISOString());
    logDevelopment("Archive range end", end.toISOString());
    logDevelopment("Archive results", posts.length);

    res.json({ posts: posts.map(serializePost) });
  } catch (error) {
    next(error);
  }
}

export async function getPostById(req, res, next) {
  try {
    assertDatabaseConnection();

    if (!mongoose.isValidObjectId(req.params.id)) {
      const error = new Error("投稿が見つかりません。");
      error.status = 404;
      throw error;
    }

    const query = await buildVisiblePostQuery(req.user?.id, { _id: req.params.id });
    const post = await Post.findOne(query).populate("userId", "displayName");

    if (!post) {
      const error = new Error("投稿が見つかりません。");
      error.status = 404;
      throw error;
    }

    res.json({ post: serializePost(post) });
  } catch (error) {
    next(error);
  }
}

export async function getMyPosts(req, res, next) {
  try {
    assertDatabaseConnection();

    const posts = await Post.find({ userId: req.user.id })
      .populate("userId", "displayName")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ posts: posts.map(serializePost) });
  } catch (error) {
    next(error);
  }
}
