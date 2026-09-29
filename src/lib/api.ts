import { getProvider } from "./providers/registry";
import type { ListParams, ListResult, Movie, ProviderId } from "./types";

export * from "./types";

/** Every movie seen in this session, keyed by `provider:id`. */
export const pool = new Map<string, Movie>();

const TTL = 5 * 60 * 1000;
const cache = new Map<string, { at: number; promise: Promise<ListResult> }>();

export function fetchList(pid: ProviderId, p: ListParams): Promise<ListResult> {
  const key = [pid, p.type, p.year, p.sort, p.name, p.page ?? 1, p.genre, p.size].join("|");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.promise;

  const promise = getProvider(pid)
    .list(p)
    .then((res) => {
      res.items.forEach((m) => pool.set(m.key, m));
      return res;
    });
  promise.catch(() => cache.delete(key));
  cache.set(key, { at: Date.now(), promise });
  return promise;
}

export function mergeUnique(a: Movie[], b: Movie[]): Movie[] {
  const seen = new Set(a.map((m) => m.key));
  const out = [...a];
  for (const m of b) {
    if (!seen.has(m.key)) {
      seen.add(m.key);
      out.push(m);
    }
  }
  return out;
}

/** Loads several pages and merges them. Fails only when every page fails. */
export async function fetchPages(pid: ProviderId, p: Omit<ListParams, "page">, pages: number[]): Promise<ListResult> {
  const results: (ListResult | null)[] = [];

  if (getProvider(pid).features.sequential) {
    for (const page of pages) {
      try {
        results.push(await fetchList(pid, { ...p, page }));
      } catch {
        results.push(null);
        break;
      }
    }
  } else {
    const settled = await Promise.allSettled(pages.map((page) => fetchList(pid, { ...p, page })));
    for (const s of settled) results.push(s.status === "fulfilled" ? s.value : null);
  }

  let items: Movie[] = [];
  let total = 0;
  let hasMore = true;
  let ok = 0;
  for (const r of results) {
    if (!r) continue;
    ok += 1;
    items = mergeUnique(items, r.items);
    total = Math.max(total, r.total);
    hasMore = r.hasMore ?? r.items.length > 0;
  }
  if (ok === 0) throw new Error("Не удалось загрузить данные");
  return { items, total, hasMore };
}

export function findMovie(pid: ProviderId, id: string, title?: string): Promise<Movie | null> {
  return getProvider(pid).find(id, title);
}

/* ---------- cross-API enrichment ---------- */

const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Finds the same title in another API (by Kinopoisk id first, then by title + year). */
export async function findEquivalent(m: Movie, pid: ProviderId): Promise<Movie | null> {
  const res = await fetchList(pid, { name: m.title, size: 30 });
  const byId = m.kinopoiskId ? res.items.find((x) => x.kinopoiskId && x.kinopoiskId === m.kinopoiskId) : undefined;
  if (byId) return byId;
  return (
    res.items.find((x) => normalize(x.title) === normalize(m.title) && (!m.year || !x.year || x.year === m.year)) ?? null
  );
}

/** Fills in what the chosen API does not know (description, voices, seasons) from the main TetrixFilm API. */
async function enrichFromMain(m: Movie): Promise<Movie> {
  const res = await fetchList("tetrix", { name: m.title, size: 20 });
  const byId = m.kinopoiskId ? res.items.find((x) => x.kinopoiskId === m.kinopoiskId) : undefined;
  const byTitle = res.items.find(
    (x) => normalize(x.title) === normalize(m.title) && (!m.year || !x.year || x.year === m.year),
  );
  const match = byId ?? byTitle;
  if (!match) return m;

  return {
    ...m,
    description: m.description ?? match.description,
    descriptionFrom: m.description ? m.descriptionFrom : match.description ? "tetrix" : null,
    voices: m.voices.length ? m.voices : match.voices,
    kp: m.kp ?? match.kp,
    kpVotes: m.kpVotes ?? match.kpVotes,
    imdb: m.imdb ?? match.imdb,
    countries: m.countries.length ? m.countries : match.countries,
    genres: m.genres.length ? m.genres : match.genres,
    seasonCounts: m.seasonCounts.length ? m.seasonCounts : match.seasonCounts,
    seasonsCount: m.seasonsCount ?? match.seasonsCount,
    episodesCount: m.episodesCount ?? match.episodesCount,
  };
}

export async function hydrateMovie(movie: Movie): Promise<Movie> {
  let current = movie;
  const provider = getProvider(movie.provider);
  if (provider.hydrate) current = await provider.hydrate(current).catch(() => current);
  if (!current.description && movie.provider !== "tetrix") {
    current = await enrichFromMain(current).catch(() => current);
  }
  const done = { ...current, hydrated: true };
  pool.set(done.key, done);
  return done;
}

/* ---------- health check ---------- */

const pings = new Map<ProviderId, { at: number; promise: Promise<number> }>();

export function pingProvider(id: ProviderId, force = false): Promise<number> {
  const hit = pings.get(id);
  if (!force && hit && Date.now() - hit.at < 60_000) return hit.promise;
  const started = performance.now();
  const promise = getProvider(id)
    .list({ type: "films", size: 1, sort: "id" })
    .then(() => Math.round(performance.now() - started));
  pings.set(id, { at: Date.now(), promise });
  promise.catch(() => pings.delete(id));
  return promise;
}

/* ---------- presentation helpers ---------- */

export function bestRating(m: Movie): number | null {
  return m.kp ?? m.imdb ?? m.shiki;
}

export function kindLabel(m: Movie): string {
  switch (m.category) {
    case "anime-serials":
      return m.isSeries ? "Аниме-сериал" : "Аниме";
    case "cartoon":
      return m.isSeries ? "Мультсериал" : "Мультфильм";
    case "serials":
      return "Сериал";
    default:
      return "Фильм";
  }
}

export function shortQuality(q: string | null): string | null {
  if (!q) return null;
  const head = q.split(" ")[0].trim();
  return head || q;
}

export function statusLabel(s: string | null): string | null {
  if (s === "online") return "Выходит сейчас";
  if (s === "offline") return "Завершён";
  if (s === "paused") return "На паузе";
  if (s === "announced") return "Анонс";
  return null;
}

export function ratingTone(value: number): string {
  if (value >= 7) return "text-emerald-300";
  if (value >= 5.5) return "text-gold-300";
  return "text-rose-300";
}

export function similarTo(movie: Movie, limit = 14): Movie[] {
  const mine = new Set(movie.genres);
  const scored: { m: Movie; score: number }[] = [];
  pool.forEach((m) => {
    if (m.key === movie.key || !m.poster || m.provider !== movie.provider || m.category !== movie.category) return;
    const shared = m.genres.reduce((acc, g) => acc + (mine.has(g) ? 1 : 0), 0);
    if (shared === 0) return;
    scored.push({ m, score: shared * 10 + (bestRating(m) ?? 0) });
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.m);
}
