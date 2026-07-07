import { env } from "../config/env.js";
import { searchMockTracks } from "./mockMusicData.js";

function artworkUrlFromApple(artwork) {
  if (!artwork?.url) {
    return "";
  }

  return artwork.url.replace("{w}", "400").replace("{h}", "400");
}

function mapAppleSong(song) {
  const attributes = song.attributes || {};

  return {
    externalId: song.id,
    title: attributes.name || "",
    artist: attributes.artistName || "",
    album: attributes.albumName || "",
    artworkUrl: artworkUrlFromApple(attributes.artwork),
    previewUrl: attributes.previews?.[0]?.url || "",
    externalUrl: attributes.url || ""
  };
}

function mockMusicResponse(query, reason) {
  return {
    source: "mock",
    message: "現在はデモ楽曲を表示しています",
    reason,
    tracks: searchMockTracks(query)
  };
}

export async function searchMusic(query) {
  const term = query.trim();

  if (!term) {
    return mockMusicResponse(query, "empty-query");
  }

  if (!env.appleMusicDeveloperToken) {
    return mockMusicResponse(query, "missing-token");
  }

  const params = new URLSearchParams({
    term,
    types: "songs",
    limit: "20",
    l: "ja-JP"
  });

  const url = `https://api.music.apple.com/v1/catalog/${env.appleMusicStorefront}/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.appleMusicDeveloperToken}`
      }
    });

    if (!response.ok) {
      return mockMusicResponse(query, `apple-music-${response.status}`);
    }

    const data = await response.json();
    const tracks = data.results?.songs?.data?.map(mapAppleSong).filter((track) => track.title && track.artist) || [];

    return {
      source: "apple-music",
      message: "",
      reason: "",
      tracks
    };
  } catch (error) {
    console.error("Apple Music search failed:", error.message);
    return mockMusicResponse(query, "apple-music-network-error");
  }
}
