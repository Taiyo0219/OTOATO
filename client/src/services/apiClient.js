import { mockArchivePosts, mockNearbyPosts, mockTracks } from "../utils/mockData.js";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "") || "";
const API_BASE_URL = configuredApiBaseUrl ? `${configuredApiBaseUrl}/api` : "/api";

function getRequestUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("/api")) {
    return configuredApiBaseUrl ? `${configuredApiBaseUrl}${normalizedPath}` : normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

function logApiDebug({ url, status, error }) {
  if (!import.meta.env.DEV) {
    return;
  }

  console.debug("API request:", url);
  if (status) {
    console.debug("API status:", status);
  }
  if (error) {
    console.debug("API error:", error.message || String(error));
  }
}

async function requestJson(path, options) {
  const url = getRequestUrl(path);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      },
      ...options
    });

    logApiDebug({ url, status: response.status });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "API通信に失敗しました。");
    }

    return data;
  } catch (error) {
    logApiDebug({ url, error });
    throw error;
  }
}

export async function fetchHealth() {
  return requestJson("/health");
}

export async function searchMusic(query) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      source: "mock",
      message: "",
      tracks: mockTracks
    };
  }

  if (normalizedQuery.length < 2) {
    return {
      source: "local",
      message: "2文字以上で検索してください",
      tracks: []
    };
  }

  try {
    return await requestJson(`/music/search?q=${encodeURIComponent(normalizedQuery)}`);
  } catch (error) {
    const tracks = mockTracks.filter((track) =>
      `${track.title} ${track.artist}`.toLowerCase().includes(normalizedQuery.toLowerCase())
    );

    return {
      source: "mock",
      message: "現在はデモ楽曲を表示しています",
      tracks: tracks.length > 0 ? tracks : mockTracks
    };
  }
}

export async function createPost(payload) {
  const data = await requestJson("/posts", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data.post;
}

export async function fetchNearbyPosts({ latitude, longitude, radius = 1000 }) {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
      radius: String(radius)
    });
    const data = await requestJson(`/posts/nearby?${params.toString()}`);

    return {
      source: "api",
      message: "",
      posts: data.posts
    };
  } catch (error) {
    return {
      source: "mock",
      message: "現在はデモ投稿を表示しています",
      posts: mockNearbyPosts
    };
  }
}

export async function fetchArchivePosts(date) {
  if (import.meta.env.DEV) {
    console.log("Archive request date:", date);
  }

  try {
    const data = await requestJson(`/posts/archive?date=${encodeURIComponent(date)}`);

    return {
      source: "api",
      message: "",
      posts: data.posts
    };
  } catch (error) {
    return {
      source: "mock",
      message: "現在はデモ投稿を表示しています",
      posts: mockArchivePosts.filter((post) => post.createdAt.startsWith(date))
    };
  }
}

export async function fetchPostById(id) {
  try {
    const data = await requestJson(`/posts/${encodeURIComponent(id)}`);

    return {
      source: "api",
      message: "",
      post: data.post
    };
  } catch (error) {
    const post = [...mockNearbyPosts, ...mockArchivePosts].find((item) => item.id === id);

    return {
      source: "mock",
      message: post ? "現在はデモ投稿を表示しています" : "投稿が見つかりません",
      post: post || null
    };
  }
}
