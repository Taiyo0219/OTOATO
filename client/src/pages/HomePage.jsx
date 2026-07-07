import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import LeafletMap from "../components/LeafletMap.jsx";
import LocationStatusPanel from "../components/LocationStatusPanel.jsx";
import MapBottomSheet from "../components/MapBottomSheet.jsx";
import PostListItem from "../components/PostListItem.jsx";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { fetchNearbyPosts } from "../services/apiClient.js";
import { mockNearbyPosts } from "../utils/mockData.js";

function HomePage({ navigate }) {
  const [posts, setPosts] = useState(mockNearbyPosts);
  const [selectedPost, setSelectedPost] = useState(mockNearbyPosts[0]);
  const [postsStatus, setPostsStatus] = useState("idle");
  const [postsMessage, setPostsMessage] = useState("現在はデモ投稿を表示しています");
  const { status, coords, errorMessage, requestLocation } = useGeolocation();

  useEffect(() => {
    if (!coords) {
      return;
    }

    let isActive = true;

    async function loadNearbyPosts() {
      setPostsStatus("loading");
      const result = await fetchNearbyPosts({
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius: 1000
      });

      if (!isActive) {
        return;
      }

      setPosts(result.posts);
      setPostsMessage(result.message);
      setPostsStatus(result.source === "api" ? "success" : "mock");
      setSelectedPost(result.posts[0] || null);
    }

    loadNearbyPosts();

    return () => {
      isActive = false;
    };
  }, [coords]);

  return (
    <div className="page-stack">
      <AppHeader
        title="OTOATO"
        subtitle="いまいる場所の近くに残された音"
        onSearch={() => navigate("/post")}
        onProfile={() => navigate("/mypage")}
      />

      <div className="map-stage">
        <LeafletMap
          posts={posts}
          selectedPostId={selectedPost?.id}
          currentLocation={coords}
          onSelectPost={setSelectedPost}
        />
        <div className="map-location-overlay">
          <LocationStatusPanel
            status={status}
            coords={coords}
            errorMessage={errorMessage}
            onRequest={requestLocation}
            compact
          />
        </div>
        <MapBottomSheet post={selectedPost} onOpenDetails={(post) => navigate(`/posts/${post.id}`)} />
      </div>

      {postsStatus === "loading" ? <p className="status-banner">周辺の投稿を取得中です</p> : null}
      {postsMessage ? <p className="status-banner">{postsMessage}</p> : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>近くの投稿</h2>
          <span>{posts.length} videos</span>
        </div>
        {posts.length > 0 ? (
          <div className="list-stack">
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} onOpenDetails={() => navigate(`/posts/${post.id}`)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>この周辺の投稿はまだありません。</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
