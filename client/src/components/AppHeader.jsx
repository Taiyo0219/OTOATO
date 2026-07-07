import { Search, UserRound } from "lucide-react";

function AppHeader({ title = "OTOATO", subtitle, onSearch, onProfile }) {
  return (
    <header className="app-header">
      <div>
        <p className="brand-kicker">OTOATO</p>
        <h1>{title}</h1>
        {subtitle ? <p className="header-subtitle">{subtitle}</p> : null}
      </div>
      <div className="header-actions">
        {onSearch ? (
          <button className="icon-button" type="button" aria-label="検索" onClick={onSearch}>
            <Search size={20} aria-hidden="true" />
          </button>
        ) : null}
        {onProfile ? (
          <button className="icon-button" type="button" aria-label="マイページ" onClick={onProfile}>
            <UserRound size={20} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default AppHeader;
