import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  appleMusicDeveloperToken: process.env.APPLE_MUSIC_DEVELOPER_TOKEN || "",
  appleMusicStorefront: process.env.APPLE_MUSIC_STOREFRONT || "jp",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development"
};
