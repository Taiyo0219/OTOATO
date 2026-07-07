export const mockTracks = [
  {
    externalId: "mock-1",
    title: "Night Walk Signal",
    artist: "Aoi Meridian",
    album: "Afterglow City",
    artworkUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: "",
    color: "linear-gradient(135deg, #ff4f81, #2ad4ff)"
  },
  {
    externalId: "mock-2",
    title: "雨上がりのベースライン",
    artist: "Haruto Lane",
    album: "Neon Drizzle",
    artworkUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: "",
    color: "linear-gradient(135deg, #22c55e, #f97316)"
  },
  {
    externalId: "mock-3",
    title: "Platform 23:18",
    artist: "Mina Quartz",
    album: "Late Train Tapes",
    artworkUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: "",
    color: "linear-gradient(135deg, #a855f7, #facc15)"
  },
  {
    externalId: "mock-4",
    title: "朝になる前に",
    artist: "Kite Echo",
    album: "Small Hours",
    artworkUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=360&q=80",
    externalUrl: "https://music.apple.com/",
    previewUrl: "",
    color: "linear-gradient(135deg, #38bdf8, #ef4444)"
  }
];

export const mockNearbyPosts = [
  {
    id: "post-1",
    track: mockTracks[0],
    createdAt: "2026-07-07T20:42:00+09:00",
    distance: "210m",
    place: "駅前通り",
    comment: "夜の帰り道に合う音。",
    marker: { x: 62, y: 34 }
  },
  {
    id: "post-2",
    track: mockTracks[1],
    createdAt: "2026-07-07T18:09:00+09:00",
    distance: "480m",
    place: "高架下",
    comment: "雨が止んだ瞬間。",
    marker: { x: 36, y: 58 }
  },
  {
    id: "post-3",
    track: mockTracks[2],
    createdAt: "2026-07-06T23:18:00+09:00",
    distance: "820m",
    place: "ホーム端",
    comment: "終電前の感じ。",
    marker: { x: 72, y: 67 }
  }
];

export const mockArchivePosts = [
  ...mockNearbyPosts,
  {
    id: "post-4",
    track: mockTracks[3],
    createdAt: "2026-07-05T05:12:00+09:00",
    distance: "1.2km",
    place: "川沿い",
    comment: "朝になる直前。",
    marker: { x: 44, y: 42 }
  }
];

export const mockUser = {
  username: "oto_user",
  avatarInitial: "O",
  postCount: 12,
  favoritePlace: "駅前通り",
  posts: [mockNearbyPosts[0], mockNearbyPosts[2], mockArchivePosts[3]]
};
