import { useEffect, useMemo, useState } from "react";
import type { Category, ProviderId } from "./types";

export type Route =
  | { name: "home" }
  | { name: "catalog"; category: Category; genre?: string }
  | { name: "library" }
  | { name: "api" }
  | { name: "movie"; provider: ProviderId; id: string; title?: string; play?: boolean };

const CATEGORIES: Category[] = ["films", "serials", "cartoon", "anime-serials"];
const PROVIDER_IDS: ProviderId[] = ["tetrix", "evloev", "kodik"];

export function formatRoute(r: Route): string {
  switch (r.name) {
    case "catalog": {
      const q = r.genre ? `?genre=${encodeURIComponent(r.genre)}` : "";
      return `#/catalog/${r.category}${q}`;
    }
    case "library":
      return "#/library";
    case "api":
      return "#/api";
    case "movie": {
      const q = new URLSearchParams();
      if (r.title) q.set("t", r.title);
      if (r.play) q.set("play", "1");
      const qs = q.toString();
      return `#/movie/${r.provider}/${encodeURIComponent(r.id)}${qs ? `?${qs}` : ""}`;
    }
    default:
      return "#/";
  }
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, "") || "/";
  const [path, search = ""] = raw.split("?");
  const parts = path.split("/").filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  const query = new URLSearchParams(search);

  if (parts[0] === "catalog" && CATEGORIES.includes(parts[1] as Category)) {
    return { name: "catalog", category: parts[1] as Category, genre: query.get("genre") ?? undefined };
  }
  if (parts[0] === "library") return { name: "library" };
  if (parts[0] === "api") return { name: "api" };
  if (parts[0] === "movie" && PROVIDER_IDS.includes(parts[1] as ProviderId) && parts[2]) {
    return {
      name: "movie",
      provider: parts[1] as ProviderId,
      id: parts[2],
      title: query.get("t") ?? undefined,
      play: query.get("play") === "1",
    };
  }
  return { name: "home" };
}

/** Navigation identity without the query string (used to reset scroll). */
export function routePath(r: Route): string {
  return formatRoute(r).split("?")[0];
}

export function navigate(r: Route) {
  const next = formatRoute(r);
  if (window.location.hash === next || (next === "#/" && !window.location.hash)) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = next;
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return useMemo(() => parseRoute(hash), [hash]);
}
