import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { makeMovie, type Movie, type ProviderId } from "./types";
import { isProviderId } from "./providers/registry";

const FAV_KEY = "evolvefilm:favorites:v2";
const HISTORY_KEY = "evolvefilm:history:v2";
const SEEN_KEY = "evolvefilm:seen:v1";
const LEGACY_FAV_KEY = "evolvefilm:favorites:v1";
const LEGACY_HISTORY_KEY = "evolvefilm:history:v1";
const HISTORY_LIMIT = 30;
const SEEN_LIMIT = 40;

/** Accepts both the current shape and the v1 shape (numeric ids, no provider). */
function normalize(raw: unknown): Movie | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Movie> & { id?: string | number };
  if (r.id === undefined || r.id === null || !r.title) return null;
  const provider: ProviderId = isProviderId(r.provider) ? r.provider : "evloev";
  const id = String(r.id);
  return makeMovie({ ...r, provider, id, title: r.title, key: `${provider}:${id}` });
}

function read(key: string): Movie[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalize).filter((m): m is Movie => m !== null);
  } catch {
    return null;
  }
}

function write(key: string, value: Movie[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) — the app still works in memory */
  }
}

/** Remember opened titles so a page refresh (or a shared link) can restore them instantly. */
export function rememberMovie(movie: Movie) {
  const list = (read(SEEN_KEY) ?? []).filter((m) => m.key !== movie.key);
  list.unshift(movie);
  write(SEEN_KEY, list.slice(0, SEEN_LIMIT));
}

export function recallMovie(key: string): Movie | null {
  return (read(SEEN_KEY) ?? []).find((m) => m.key === key) ?? null;
}

interface LibraryValue {
  favorites: Movie[];
  history: Movie[];
  isFavorite: (key: string) => boolean;
  toggleFavorite: (movie: Movie) => void;
  pushHistory: (movie: Movie) => void;
  clearHistory: () => void;
}

const LibraryContext = createContext<LibraryValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Movie[]>(() => read(FAV_KEY) ?? read(LEGACY_FAV_KEY) ?? []);
  const [history, setHistory] = useState<Movie[]>(() => read(HISTORY_KEY) ?? read(LEGACY_HISTORY_KEY) ?? []);

  useEffect(() => write(FAV_KEY, favorites), [favorites]);
  useEffect(() => write(HISTORY_KEY, history), [history]);

  const favKeys = useMemo(() => new Set(favorites.map((m) => m.key)), [favorites]);
  const isFavorite = useCallback((key: string) => favKeys.has(key), [favKeys]);

  const toggleFavorite = useCallback((movie: Movie) => {
    setFavorites((prev) =>
      prev.some((m) => m.key === movie.key) ? prev.filter((m) => m.key !== movie.key) : [movie, ...prev],
    );
  }, []);

  const pushHistory = useCallback((movie: Movie) => {
    setHistory((prev) => [movie, ...prev.filter((m) => m.key !== movie.key)].slice(0, HISTORY_LIMIT));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({ favorites, history, isFavorite, toggleFavorite, pushHistory, clearHistory }),
    [favorites, history, isFavorite, toggleFavorite, pushHistory, clearHistory],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
