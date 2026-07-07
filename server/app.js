import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();

const allowedOrigins = env.clientOrigin.split(",").map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || env.nodeEnv === "development" || allowedOrigins.includes(origin)) {
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

app.use("/api/health", healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
