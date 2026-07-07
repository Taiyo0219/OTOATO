import { env } from "../config/env.js";

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  res.status(status).json({
    message: status === 500 ? "サーバーでエラーが発生しました。" : error.message,
    details: env.nodeEnv === "development" ? error.message : undefined
  });
}
