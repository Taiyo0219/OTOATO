export const mockTracks = [
  {
    provider: "youtube",
    externalId: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    artworkUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "linear-gradient(135deg, #ff4f81, #2ad4ff)"
  },
  {
    provider: "youtube",
    externalId: "9bZkp7q19f0",
    title: "Gangnam Style",
    artist: "PSY",
    artworkUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    color: "linear-gradient(135deg, #22c55e, #f97316)"
  },
  {
    provider: "youtube",
    externalId: "3JZ_D3ELwOQ",
    title: "See You Again",
    artist: "Wiz Khalifa",
    artworkUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    color: "linear-gradient(135deg, #a855f7, #facc15)"
  },
  {
    provider: "youtube",
    externalId: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi",
    artworkUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=480&q=80",
    externalUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
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
    location: { latitude: 35.68135, longitude: 139.76709 },
    marker: { x: 62, y: 34 }
  },
  {
    id: "post-2",
    track: mockTracks[1],
    createdAt: "2026-07-07T18:09:00+09:00",
    distance: "480m",
    place: "高架下",
    comment: "雨が止んだ瞬間。",
    location: { latitude: 35.67889, longitude: 139.76481 },
    marker: { x: 36, y: 58 }
  },
  {
    id: "post-3",
    track: mockTracks[2],
    createdAt: "2026-07-06T23:18:00+09:00",
    distance: "820m",
    place: "ホーム端",
    comment: "終電前の感じ。",
    location: { latitude: 35.68428, longitude: 139.76919 },
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
    location: { latitude: 35.67591, longitude: 139.77122 },
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
