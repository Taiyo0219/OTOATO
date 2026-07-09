import { useEffect, useState } from "react";

const knownPaths = new Set(["/", "/explore", "/post", "/archive", "/mypage", "/auth"]);

function normalizePath(pathname) {
  const cleanPath = pathname.split(/[?#]/)[0];

  if (/^\/posts\/[^/]+$/.test(cleanPath)) {
    return cleanPath;
  }

  if (/^\/users\/[^/]+$/.test(cleanPath) || /^\/users\/[^/]+\/day-trace$/.test(cleanPath)) {
    return cleanPath;
  }

  return knownPaths.has(cleanPath) ? cleanPath : "/";
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
    const targetUrl = new URL(nextPath, window.location.origin);
    const safePath = normalizePath(targetUrl.pathname);
    const nextHref = `${safePath}${targetUrl.search}`;
    const currentHref = `${path}${window.location.search}`;

    if (nextHref !== currentHref) {
      window.history.pushState({}, "", nextHref);
      setPath(safePath);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  return { path, navigate };
}
