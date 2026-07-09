import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

function createAuthError(message = "ログインが必要です。") {
  const error = new Error(message);
  error.status = 401;
  return error;
}

function createConfigError() {
  const error = new Error("認証設定が未完了です。JWT_SECRETを設定してください。");
  error.status = 503;
  return error;
}

function getBearerToken(req) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return "";
  }

  return token.trim();
}

async function verifyToken(token) {
  if (!env.jwtSecret) {
    throw createConfigError();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const userId = payload.sub;

    if (!userId) {
      throw createAuthError("認証情報が無効です。");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw createAuthError("認証情報が無効です。");
    }

    return user;
  } catch (error) {
    if (error.status) {
      throw error;
    }

    throw createAuthError("認証情報が無効です。");
  }
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      throw createAuthError();
    }

    const user = await verifyToken(token);
    req.user = {
      id: String(user._id),
      displayName: user.displayName,
      email: user.email
    };
    req.userDocument = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function attachOptionalUser(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      next();
      return;
    }

    const user = await verifyToken(token);
    req.user = {
      id: String(user._id),
      displayName: user.displayName,
      email: user.email
    };
    req.userDocument = user;
    next();
  } catch (error) {
    next();
  }
}
