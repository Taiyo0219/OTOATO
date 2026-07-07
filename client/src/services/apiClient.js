import { mockArchivePosts, mockNearbyPosts, mockTracks } from "../utils/mockData.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function requestJson(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "API通信に失敗しました。");
  }

  return data;
}

export async function fetchHealth() {
  return requestJson("/api/health");
}

export async function searchMusic(query) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      source: "mock",
      message: "現在はデモ楽曲を表示しています",
      tracks: mockTracks
    };
  }

  try {
    return await requestJson(`/api/music/search?q=${encodeURIComponent(normalizedQuery)}`);
  } catch (error) {
    return {
      source: "mock",
      message: "現在はデモ楽曲を表示しています",
      tracks: mockTracks.filter((track) =>
        `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(normalizedQuery.toLowerCase())
      )
    };
  }
}

export async function createPost(payload) {
  const data = await requestJson("/api/posts", {
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
    const data = await requestJson(`/api/posts/nearby?${params.toString()}`);

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
  try {
    const data = await requestJson(`/api/posts/archive?date=${encodeURIComponent(date)}`);

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
