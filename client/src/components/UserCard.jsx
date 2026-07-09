import { Music2, UserPlus, UsersRound } from "lucide-react";

function relationshipLabel(user) {
  const relationship = user.relationship || {};

  if (relationship.isSelf) {
    return "自分";
  }

  if (relationship.isFriend) {
    return "友達";
  }

  if (relationship.isFollowing) {
    return "フォロー中";
  }

  if (relationship.isFollowedBy) {
    return "フォローされています";
  }

  return "未フォロー";
}

function UserCard({ user, onOpen, onFollow, onLogin, busy = false, compact = false }) {
  const relationship = user.relationship || {};
  const canFollow = !relationship.isSelf && onFollow;
  const followLabel = relationship.isFollowing ? "解除" : relationship.isFollowedBy ? "フォローして友達に" : "フォロー";

  return (
    <article className={`user-card${compact ? " is-compact" : ""}`}>
      <button className="user-card-main" type="button" onClick={() => onOpen?.(user)}>
        <div className="profile-avatar profile-avatar-sm" aria-hidden="true">
          {user.displayName?.slice(0, 1).toUpperCase() || "O"}
        </div>
        <div className="user-card-copy">
          <div className="user-card-title-row">
            <h3>{user.displayName}</h3>
            <span className="relationship-badge">{relationshipLabel(user)}</span>
          </div>
          {user.bio ? <p>{user.bio}</p> : <p className="muted-text">まだプロフィール文はありません。</p>}
          {user.favoriteGenres?.length ? (
            <div className="genre-list">
              {user.favoriteGenres.slice(0, 4).map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
            </div>
          ) : null}
          <div className="post-inline-meta">
            <span>
              <UsersRound size={13} aria-hidden="true" />
              {user.followerCount || 0} followers
            </span>
            <span>
              <Music2 size={13} aria-hidden="true" />
              {user.followingCount || 0} following
            </span>
          </div>
        </div>
      </button>

      {canFollow ? (
        <button className="soft-button user-card-action" type="button" disabled={busy} onClick={() => onFollow(user)}>
          <UserPlus size={16} aria-hidden="true" />
          <span>{busy ? "処理中" : followLabel}</span>
        </button>
      ) : onLogin && !relationship.isSelf ? (
        <button className="soft-button user-card-action" type="button" onClick={onLogin}>
          ログイン
        </button>
      ) : null}
    </article>
  );
}

export default UserCard;
