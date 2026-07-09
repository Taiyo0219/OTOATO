import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isDatabaseConnected } from "../config/database.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { serializeUser } from "../utils/userSerializer.js";

const PASSWORD_MIN_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function assertAuthReady() {
  if (!isDatabaseConnected()) {
    const error = new Error("MongoDBに接続されていないため、認証機能を利用できません。");
    error.status = 503;
    throw error;
  }

  if (!env.jwtSecret) {
    const error = new Error("認証設定が未完了です。JWT_SECRETを設定してください。");
    error.status = 503;
    throw error;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateRegisterPayload(body) {
  const displayName = String(body.displayName || "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!displayName) {
    throw createValidationError("表示名は必須です。");
  }

  if (displayName.length > 40) {
    throw createValidationError("表示名は40文字以内で入力してください。");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createValidationError("メールアドレスの形式が正しくありません。");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw createValidationError(`パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください。`);
  }

  return { displayName, email, password };
}

function validateLoginPayload(body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!EMAIL_PATTERN.test(email) || !password) {
    throw createValidationError("メールアドレスとパスワードを入力してください。");
  }

  return { email, password };
}

function createToken(user) {
  return jwt.sign(
    {
      displayName: user.displayName
    },
    env.jwtSecret,
    {
      subject: String(user._id),
      expiresIn: env.jwtExpiresIn
    }
  );
}

function createAuthResponse(user) {
  return {
    user: serializeUser(user),
    token: createToken(user)
  };
}

export async function register(req, res, next) {
  try {
    assertAuthReady();
    const payload = validateRegisterPayload(req.body);
    const existingUser = await User.exists({ email: payload.email });

    if (existingUser) {
      const error = new Error("このメールアドレスは既に登録されています。");
      error.status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await User.create({
      displayName: payload.displayName,
      email: payload.email,
      passwordHash
    });

    res.status(201).json(createAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    assertAuthReady();
    const payload = validateLoginPayload(req.body);
    const user = await User.findOne({ email: payload.email }).select("+passwordHash");
    const isValidPassword = user ? await bcrypt.compare(payload.password, user.passwordHash) : false;

    if (!user || !isValidPassword) {
      const error = new Error("メールアドレスまたはパスワードが正しくありません。");
      error.status = 401;
      throw error;
    }

    res.json(createAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: serializeUser(req.userDocument) });
}

export function logout(req, res) {
  res.json({ ok: true });
}
