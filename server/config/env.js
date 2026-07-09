import dotenv from "dotenv";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));
export const serverEnvPath = resolve(configDir, "..", ".env");
const isProductionRuntime = process.env.NODE_ENV === "production";

const defaultEnvTemplate = `PORT=5000
MONGODB_URI=
YOUTUBE_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=
JWT_EXPIRES_IN=30d
`;

if (!existsSync(serverEnvPath)) {
  console.warn("Environment: server/.env not found");

  if (!isProductionRuntime) {
    try {
      writeFileSync(serverEnvPath, defaultEnvTemplate, { flag: "wx" });
      console.warn("Environment: created server/.env template");
    } catch (error) {
      console.warn(`Environment: could not create server/.env template (${error.message})`);
    }
  }
}

if (existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

export const hasYouTubeApiKey =
  typeof process.env.YOUTUBE_API_KEY === "string" &&
  process.env.YOUTUBE_API_KEY.trim().length > 0;

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "",
  youtubeApiKey: hasYouTubeApiKey ? process.env.YOUTUBE_API_KEY.trim() : "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  nodeEnv: process.env.NODE_ENV || "development"
};

export function logEnvironmentStatus() {
  console.log(`YouTube API key: ${hasYouTubeApiKey ? "configured" : "not configured"}`);
  console.log(`Music provider: ${hasYouTubeApiKey ? "youtube" : "mock"}`);
  console.log(`JWT secret: ${env.jwtSecret ? "configured" : "not configured"}`);
}
