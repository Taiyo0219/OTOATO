import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not set. MongoDB connection was skipped.");
    return { connected: false, reason: "missing-uri" };
  }

  try {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected.");
    return { connected: true };
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return { connected: false, reason: "connection-failed", error: error.message };
  }
}

export function getDatabaseStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  return {
    state: states[mongoose.connection.readyState] || "unknown"
  };
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
