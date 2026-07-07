import { useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import MapBottomSheet from "../components/MapBottomSheet.jsx";
import MockMap from "../components/MockMap.jsx";
import PostListItem from "../components/PostListItem.jsx";
import { mockNearbyPosts } from "../utils/mockData.js";

function HomePage({ navigate }) {
  const [selectedPost, setSelectedPost] = useState(mockNearbyPosts[0]);

  return (
    <div className="page-stack">
      <AppHeader
        title="OTOATO"
        subtitle="いまいる場所の近くに残された音"
        onSearch={() => navigate("/post")}
        onProfile={() => navigate("/mypage")}
      />

      <div className="map-stage">
        <MockMap
          posts={mockNearbyPosts}
          selectedId={selectedPost?.id}
          onSelect={setSelectedPost}
        />
        <MapBottomSheet post={selectedPost} />
      </div>

      <section className="content-section">
        <div className="section-heading">
          <h2>近くの投稿</h2>
          <span>{mockNearbyPosts.length} songs</span>
        </div>
        <div className="list-stack">
          {mockNearbyPosts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
