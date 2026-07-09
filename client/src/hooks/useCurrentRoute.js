import { useEffect, useState } from "react";

const knownPaths = new Set(["/", "/post", "/archive", "/mypage", "/auth"]);

function normalizePath(pathname) {
  if (/^\/posts\/[^/]+$/.test(pathname)) {
    return pathname;
  }

  return knownPaths.has(pathname) ? pathname : "/";
}

export function useCurrentRoute() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextPath) => {
    const safePath = normalizePath(nextPath);

    if (safePath !== path) {
      window.history.pushState({}, "", safePath);
      setPath(safePath);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  return { path, navigate };
}
