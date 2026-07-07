export const mockTracks = [
  {
    externalId: "mock-1",
    title: "Night Walk Signal",
    artist: "Aoi Meridian",
    album: "Afterglow City",
    artworkUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    externalId: "mock-2",
    title: "雨上がりのベースライン",
    artist: "Haruto Lane",
    album: "Neon Drizzle",
    artworkUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: ""
  },
  {
    externalId: "mock-3",
    title: "Platform 23:18",
    artist: "Mina Quartz",
    album: "Late Train Tapes",
    artworkUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    externalId: "mock-4",
    title: "朝になる前に",
    artist: "Kite Echo",
    album: "Small Hours",
    artworkUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: ""
  }
];

export function searchMockTracks(query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return mockTracks;
  }

  return mockTracks.filter((track) =>
    `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(normalizedQuery)
  );
}
