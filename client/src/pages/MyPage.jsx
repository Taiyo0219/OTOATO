import AppHeader from "../components/AppHeader.jsx";
import PostListItem from "../components/PostListItem.jsx";
import { mockUser } from "../utils/mockData.js";

function MyPage() {
  return (
    <div className="page-stack">
      <AppHeader title="マイページ" subtitle="自分が残した音の履歴" />

      <section className="profile-panel">
        <div className="profile-avatar" aria-hidden="true">
          {mockUser.avatarInitial}
        </div>
        <div>
          <p className="panel-eyebrow">User</p>
          <h2>{mockUser.username}</h2>
          <p>{mockUser.postCount} posts · {mockUser.favoritePlace}</p>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>投稿履歴</h2>
          <span>{mockUser.posts.length} songs</span>
        </div>
        <div className="list-stack">
          {mockUser.posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default MyPage;
