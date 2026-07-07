import { Music2 } from "lucide-react";

function MockMap({ posts, selectedId, onSelect }) {
  return (
    <section className="mock-map" aria-label="周辺の投稿">
      <div className="map-road map-road-main" />
      <div className="map-road map-road-cross" />
      <div className="map-label map-label-top">Station</div>
      <div className="map-label map-label-bottom">River Side</div>

      {posts.map((post) => (
        <button
          key={post.id}
          className={`map-marker${selectedId === post.id ? " is-active" : ""}`}
          type="button"
          aria-label={`${post.track.title}を表示`}
          style={{ left: `${post.marker.x}%`, top: `${post.marker.y}%` }}
          onClick={() => onSelect(post)}
        >
          <Music2 size={18} aria-hidden="true" />
        </button>
      ))}
    </section>
  );
}

export default MockMap;
