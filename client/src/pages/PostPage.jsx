import { useMemo, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import AlbumArtwork from "../components/AlbumArtwork.jsx";
import AppHeader from "../components/AppHeader.jsx";
import TrackCard from "../components/TrackCard.jsx";
import { mockTracks } from "../utils/mockData.js";

const visibilityOptions = [
  { value: "private", label: "自分だけ" },
  { value: "friends", label: "友達のみ" },
  { value: "public", label: "全体公開" }
];

function PostPage() {
  const [query, setQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(mockTracks[0]);
  const [visibility, setVisibility] = useState("public");
  const [comment, setComment] = useState("");

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return mockTracks;
    }

    return mockTracks.filter((track) =>
      `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div className="page-stack">
      <AppHeader title="この場所に残す曲" subtitle="曲を選んで、短い記憶を添える" />

      <section className="search-panel">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="曲名・アーティスト名で検索"
          />
        </label>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>検索結果</h2>
          <span>{filteredTracks.length} songs</span>
        </div>
        <div className="list-stack">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track.externalId}
              track={track}
              isSelected={selectedTrack.externalId === track.externalId}
              onSelect={setSelectedTrack}
            />
          ))}
        </div>
      </section>

      <section className="selected-track-panel">
        <AlbumArtwork track={selectedTrack} size="xl" />
        <div>
          <p className="panel-eyebrow">Selected</p>
          <h2>{selectedTrack.title}</h2>
          <p>{selectedTrack.artist}</p>
        </div>
      </section>

      <section className="form-panel">
        <button className="wide-soft-button" type="button" disabled>
          <LocateFixed size={18} aria-hidden="true" />
          <span>現在地を取得</span>
        </button>

        <div className="segmented-control" role="group" aria-label="公開範囲">
          {visibilityOptions.map((option) => (
            <button
              key={option.value}
              className={visibility === option.value ? "is-active" : ""}
              type="button"
              onClick={() => setVisibility(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="comment-field">
          <span>コメント</span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value.slice(0, 80))}
            rows="3"
            maxLength="80"
            placeholder="80文字まで"
          />
          <small>{comment.length}/80</small>
        </label>

        <button className="primary-button" type="button" disabled>
          この曲を残す
        </button>
      </section>
    </div>
  );
}

export default PostPage;
