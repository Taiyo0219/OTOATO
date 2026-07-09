import { mockArchivePosts, mockNearbyPosts, mockTracks } from "../utils/mockData.js";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "") || "";
const API_BASE_URL = configuredApiBaseUrl ? `${configuredApiBaseUrl}/api` : "/api";
const AUTH_TOKEN_STORAGE_KEY = "otoato_auth_token";

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

export function getStoredAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
}

export function setStoredAuthToken(token) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
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

async function requestJson(path, options = {}) {
  const url = getRequestUrl(path);
  const {
    includeAuth = false,
    headers,
    ...fetchOptions
  } = options;
  const token = includeAuth ? getStoredAuthToken() : "";
  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      ...fetchOptions
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

export async function registerUser(payload) {
  const data = await requestJson("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  setStoredAuthToken(data.token);
  return data.user;
}

export async function loginUser(payload) {
  const data = await requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  setStoredAuthToken(data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  const data = await requestJson("/auth/me", {
    includeAuth: true
  });

  return data.user;
}

export async function logoutUser() {
  try {
    await requestJson("/auth/logout", {
      method: "POST",
      includeAuth: true
    });
  } finally {
    clearStoredAuthToken();
  }
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
    includeAuth: true,
    body: JSON.stringify(payload)
  });

  return data.post;
}

export async function fetchMyPosts() {
  const data = await requestJson("/posts/mine", {
    includeAuth: true
  });

  return data.posts;
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
    const data = await requestJson(`/posts/${encodeURIComponent(id)}`, {
      includeAuth: true
    });

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
