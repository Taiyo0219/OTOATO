import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import AlbumArtwork from "../components/AlbumArtwork.jsx";
import AppHeader from "../components/AppHeader.jsx";
import LeafletMap from "../components/LeafletMap.jsx";
import LocationStatusPanel from "../components/LocationStatusPanel.jsx";
import TrackCard from "../components/TrackCard.jsx";
import TrackPreviewPanel from "../components/TrackPreviewPanel.jsx";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { createPost, searchMusic } from "../services/apiClient.js";
import { mockTracks } from "../utils/mockData.js";

const visibilityOptions = [
  { value: "private", label: "自分だけ" },
  { value: "friends", label: "友達のみ" },
  { value: "public", label: "全体公開" }
];

function PostPage() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState(mockTracks);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [comment, setComment] = useState("");
  const [locationMode, setLocationMode] = useState("current");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [musicStatus, setMusicStatus] = useState("mock");
  const [musicMessage, setMusicMessage] = useState("現在はデモ楽曲を表示しています");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const { status, coords, errorMessage, requestLocation } = useGeolocation();

  const selectedVisibilityLabel = visibilityOptions.find((option) => option.value === visibility)?.label;
  const normalizedQuery = query.trim();
  const canSearch = normalizedQuery.length >= 2 && musicStatus !== "loading";
  const canSubmit = Boolean(selectedTrack?.externalId && selectedLocation && visibility);

  useEffect(() => {
    if (coords && locationMode === "current") {
      setSelectedLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        source: "current"
      });
    }
  }, [coords, locationMode]);

  const handleSearch = async (event) => {
    event?.preventDefault();

    if (!canSearch) {
      if (normalizedQuery.length > 0 && normalizedQuery.length < 2) {
        setMusicMessage("2文字以上で検索してください");
      }
      return;
    }

    setMusicStatus("loading");
    setMusicMessage("");
    setSubmitMessage("");

    const result = await searchMusic(normalizedQuery);

    setTracks(result.tracks || []);
    setSelectedTrack(null);
    setMusicMessage(result.message || "");
    setMusicStatus(result.source === "mock" ? "mock" : "success");
  };

  const handleUseCurrentLocation = () => {
    setLocationMode("current");

    if (coords) {
      setSelectedLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        source: "current"
      });
      return;
    }

    requestLocation();
  };

  const handleUseDevelopmentLocation = () => {
    setLocationMode("manual");
    setSelectedLocation({
      latitude: 35.681236,
      longitude: 139.767125,
      accuracy: 25,
      source: "development"
    });
  };

  const handleMapLocationSelect = (location) => {
    setLocationMode("manual");
    setSelectedLocation(location);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitStatus("loading");
    setSubmitMessage("");

    try {
      await createPost({
        track: selectedTrack,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        visibility,
        comment
      });
      setSubmitStatus("success");
      setSubmitMessage("投稿を保存しました。ホームやアーカイブで確認できます。");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error.message || "投稿に失敗しました。");
    }
  };

  return (
    <div className="page-stack">
      <AppHeader title="この場所に残す曲" subtitle="曲を選んで、短い記憶を添える" />

      <form className="search-panel" onSubmit={handleSearch}>
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="曲名・アーティスト名・動画名で検索"
          />
        </label>
        <button className="primary-button" type="submit" disabled={!canSearch}>
          {musicStatus === "loading" ? "検索中..." : "検索"}
        </button>
      </form>

      {musicStatus === "loading" ? <p className="status-banner">楽曲を検索中です</p> : null}
      {musicMessage ? <p className="status-banner">{musicMessage}</p> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>検索結果</h2>
          <span>{tracks.length} videos</span>
        </div>
        {tracks.length > 0 ? (
          <div className="list-stack">
            {tracks.map((track) => (
              <TrackCard
                key={track.externalId}
                track={track}
                isSelected={selectedTrack?.externalId === track.externalId}
                onSelect={setSelectedTrack}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>該当する曲が見つかりません。</p>
          </div>
        )}
      </section>

      {selectedTrack ? (
        <>
          <section className="selected-track-panel">
            <AlbumArtwork track={selectedTrack} size="xl" />
            <div>
              <p className="panel-eyebrow">Selected</p>
              <h2>{selectedTrack.title}</h2>
              <p>{selectedTrack.artist}</p>
            </div>
          </section>

          <TrackPreviewPanel track={selectedTrack} />
        </>
      ) : null}

      <section className="form-panel">
        <div className="section-heading">
          <h2>投稿地点</h2>
          <span>{selectedLocation ? "selected" : "waiting"}</span>
        </div>

        <div className="location-mode-control" role="group" aria-label="投稿地点の選択方法">
          <button
            className={locationMode === "current" ? "is-active" : ""}
            type="button"
            onClick={handleUseCurrentLocation}
          >
            現在地を使用
          </button>
          <button
            className={locationMode === "manual" ? "is-active" : ""}
            type="button"
            onClick={() => setLocationMode("manual")}
          >
            地図から場所を選ぶ
          </button>
        </div>

        <LocationStatusPanel
          status={status}
          coords={coords}
          errorMessage={errorMessage}
          onRequest={handleUseCurrentLocation}
        />

        <div className="post-map-preview">
          <LeafletMap
            currentLocation={coords}
            selectedLocation={selectedLocation}
            onSelectLocation={locationMode === "manual" ? handleMapLocationSelect : undefined}
            compact
          />
        </div>
        <p className="helper-text">
          {locationMode === "manual"
            ? "地図をタップすると投稿地点を選べます。もう一度タップすると移動できます。"
            : "現在地取得に失敗しても、地図から場所を選べます。"}
        </p>

        {import.meta.env.DEV ? (
          <button className="wide-soft-button" type="button" onClick={handleUseDevelopmentLocation}>
            開発用テスト地点を使用
          </button>
        ) : null}

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

        <section className={`confirmation-panel${canSubmit ? "" : " is-muted"}`}>
          <div className="section-heading">
            <h2>投稿確認</h2>
            <span>{canSubmit ? "ready" : "waiting"}</span>
          </div>
          <div className="confirmation-content">
            {selectedTrack ? <AlbumArtwork track={selectedTrack} size="sm" /> : <div className="empty-artwork" />}
            <div className="confirmation-copy">
              <p className="track-title">{selectedTrack?.title || "動画未選択"}</p>
              <p className="track-meta">{selectedTrack?.artist || "検索結果から選択してください"}</p>
              <dl className="confirmation-details">
                <div>
                  <dt>場所</dt>
                  <dd>
                    {selectedLocation ? (
                      <>
                        <MapPin size={13} aria-hidden="true" />
                        {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                      </>
                    ) : (
                      "未取得"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>公開範囲</dt>
                  <dd>{selectedVisibilityLabel}</dd>
                </div>
                <div>
                  <dt>コメント</dt>
                  <dd>{comment || "なし"}</dd>
                </div>
              </dl>
            </div>
          </div>
          <button
            className="primary-button"
            type="button"
            disabled={!canSubmit || submitStatus === "loading"}
            onClick={handleSubmit}
          >
            {submitStatus === "loading" ? "保存中" : "この曲を残す"}
          </button>
          {submitMessage ? (
            <p className={submitStatus === "success" ? "success-note" : "error-note"}>{submitMessage}</p>
          ) : null}
          <p className={canSubmit ? "success-note" : "helper-text"}>
            {canSubmit ? "曲と投稿地点を組み合わせて保存できます。" : "曲を選び、投稿地点を決めると保存できます。"}
          </p>
        </section>
      </section>
    </div>
  );
}

export default PostPage;
