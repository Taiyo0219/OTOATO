import { env } from "../../config/env.js";

const CACHE_TTL_MS = 30 * 60 * 1000;
const searchCache = new Map();

function normalizeQuery(query) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function pickThumbnail(thumbnails = {}) {
  return thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "";
}

function mapYouTubeItem(item) {
  const videoId = item.id?.videoId || "";
  const snippet = item.snippet || {};

  return {
    provider: "youtube",
    externalId: videoId,
    title: snippet.title || "",
    artist: snippet.channelTitle || "",
    artworkUrl: pickThumbnail(snippet.thumbnails),
    externalUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""
  };
}

function logSearch({ query, provider, count }) {
  if (env.nodeEnv !== "development") {
    return;
  }

  console.log(`Music search request: ${query}`);
  console.log(`Music provider: ${provider}`);
  console.log(`Music results: ${count}`);
}

export function getMusicProviderStatus() {
  return env.youtubeApiKey ? "youtube" : "mock";
}

export async function searchYouTube(query) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return {
      source: "youtube",
      provider: "youtube",
      message: "",
      reason: "short-query",
      tracks: []
    };
  }

  const cached = searchCache.get(normalizedQuery);

  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    logSearch({ query: normalizedQuery, provider: "youtube-cache", count: cached.tracks.length });
    return {
      source: "youtube-cache",
      provider: "youtube",
      message: "",
      reason: "",
      tracks: cached.tracks
    };
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "10",
    q: normalizedQuery,
    videoEmbeddable: "true",
    safeSearch: "moderate",
    key: env.youtubeApiKey
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);

  if (!response.ok) {
    const text = await response.text();
    const summary = text.slice(0, 180).replace(/\s+/g, " ");
    throw new Error(`youtube-${response.status}: ${summary}`);
  }

  const data = await response.json();
  const tracks = (data.items || [])
    .map(mapYouTubeItem)
    .filter((track) => track.externalId && track.title && track.artist);

  searchCache.set(normalizedQuery, {
    createdAt: Date.now(),
    tracks
  });

  logSearch({ query: normalizedQuery, provider: "youtube", count: tracks.length });

  return {
    source: "youtube",
    provider: "youtube",
    message: "",
    reason: "",
    tracks
  };
}
