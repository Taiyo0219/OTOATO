import { env } from "../../config/env.js";
import { createMockMusicResponse } from "./mockProvider.js";
import { searchYouTube } from "./youtubeProvider.js";

export async function searchMusic(query) {
  const normalizedQuery = query.trim();

  if (env.nodeEnv === "development") {
    console.log(`Music search request: ${normalizedQuery}`);
  }

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return {
      source: "youtube",
      provider: "youtube",
      message: "2文字以上で検索してください",
      reason: "short-query",
      tracks: []
    };
  }

  if (!env.youtubeApiKey) {
    if (env.nodeEnv === "development") {
      console.log("Music provider: mock");
    }

    return createMockMusicResponse(normalizedQuery, "missing-youtube-api-key");
  }

  try {
    return await searchYouTube(normalizedQuery);
  } catch (error) {
    if (env.nodeEnv === "development") {
      console.error("YouTube search failed:", error.message);
      console.log("Music provider: mock");
    }

    return createMockMusicResponse(normalizedQuery, "youtube-search-failed");
  }
}
