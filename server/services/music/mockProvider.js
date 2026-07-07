const mockTracks = [
  {
    provider: "youtube",
    externalId: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    artworkUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    provider: "youtube",
    externalId: "9bZkp7q19f0",
    title: "Gangnam Style",
    artist: "PSY",
    artworkUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0"
  },
  {
    provider: "youtube",
    externalId: "3JZ_D3ELwOQ",
    title: "See You Again",
    artist: "Wiz Khalifa",
    artworkUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ"
  },
  {
    provider: "youtube",
    externalId: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi",
    artworkUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
  }
];

export function searchMockTracks(query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return mockTracks;
  }

  const results = mockTracks.filter((track) =>
    `${track.title} ${track.artist}`.toLowerCase().includes(normalizedQuery)
  );

  return results.length > 0 ? results : mockTracks;
}

export function createMockMusicResponse(query, reason = "mock") {
  return {
    source: "mock",
    provider: "mock",
    message: "現在はデモ楽曲を表示しています",
    reason,
    tracks: searchMockTracks(query)
  };
}
