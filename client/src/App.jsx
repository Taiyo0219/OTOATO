import { useMemo } from "react";
import BottomNavigation from "./components/BottomNavigation.jsx";
import HomePage from "./pages/HomePage.jsx";
import PostPage from "./pages/PostPage.jsx";
import ArchivePage from "./pages/ArchivePage.jsx";
import MyPage from "./pages/MyPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import DayTracePage from "./pages/DayTracePage.jsx";
import { useCurrentRoute } from "./hooks/useCurrentRoute.js";

const routeTable = {
  "/": HomePage,
  "/explore": ExplorePage,
  "/post": PostPage,
  "/archive": ArchivePage,
  "/mypage": MyPage,
  "/auth": AuthPage
};

function App() {
  const { path, navigate } = useCurrentRoute();
  const Page = useMemo(() => {
    if (path.startsWith("/posts/")) {
      return PostDetailPage;
    }

    if (/^\/users\/[^/]+\/day-trace$/.test(path)) {
      return DayTracePage;
    }

    if (/^\/users\/[^/]+$/.test(path)) {
      return UserProfilePage;
    }

    return routeTable[path] || HomePage;
  }, [path]);

  return (
    <div className="app-shell">
      <main className="app-main">
        <Page navigate={navigate} path={path} />
      </main>
      <BottomNavigation activePath={path} onNavigate={navigate} />
    </div>
  );
}

export default App;
