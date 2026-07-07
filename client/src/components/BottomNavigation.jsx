import { Archive, Home, MapPinPlus, UserRound } from "lucide-react";

const navItems = [
  { path: "/", label: "ホーム", icon: Home },
  { path: "/post", label: "投稿", icon: MapPinPlus },
  { path: "/archive", label: "アーカイブ", icon: Archive },
  { path: "/mypage", label: "マイページ", icon: UserRound }
];

function BottomNavigation({ activePath, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="メイン">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;

        return (
          <button
            className={`bottom-nav-item${isActive ? " is-active" : ""}`}
            type="button"
            key={item.path}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate(item.path)}
          >
            <Icon size={22} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
