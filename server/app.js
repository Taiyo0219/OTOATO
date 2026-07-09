import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

const allowedOrigins = env.clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (env.nodeEnv === "development") {
    return true;
  }

  return allowedOrigins.includes(origin);
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "認証リクエストが多すぎます。少し待ってから再試行してください。"
  }
});

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("This origin is not allowed by CORS."));
  }
}));
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "OTOATO API" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/posts", postRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
