import { getJson, nonNull, positive, unique } from "../http";
import {
  makeMovie,
  type Category,
  type ListParams,
  type ListResult,
  type Movie,
  type Provider,
  type SeasonInfo,
  type SortKey,
} from "../types";

/** Kodik API — https://kodikapi.com (cursor pagination through `next_page`). */
const BASE = "https://kodikapi.com";
const TOKEN = "3bd0a27dfccd284c54f4889f4a7d6453";

const TYPES: Record<Category, string> = {
  films: "foreign-movie,russian-movie",
  serials: "foreign-serial,russian-serial",
  cartoon: "foreign-cartoon,russian-cartoon,soviet-cartoon",
  "anime-serials": "anime,anime-serial",
};

const SORT: Record<SortKey, string> = {
  "-views": "updated_at",
  "-kinopoisk": "kinopoisk_rating",
  "-imdb": "imdb_rating",
  "-year": "year",
  id: "created_at",
};

interface KodikMaterial {
  title?: string;
  title_en?: string;
  description?: string;
  anime_description?: string;
  poster_url?: string;
  anime_poster_url?: string;
  screenshots?: string[];
  duration?: number;
  all_genres?: string[];
  anime_genres?: string[];
  genres?: string[];
  countries?: string[];
  kinopoisk_rating?: number;
  imdb_rating?: number;
  shikimori_rating?: number;
  minimal_age?: number;
  all_status?: string;
  anime_status?: string;
}
interface KodikEpisode {
  link: string;
  title?: string;
}
interface KodikSeason {
  link?: string;
  episodes?: Record<string, string | KodikEpisode>;
}
interface KodikItem {
  id: string;
  type?: string;
  link: string;
  title: string;
  title_orig?: string;
  year?: number;
  kinopoisk_id?: string;
  imdb_id?: string;
  shikimori_id?: string;
  quality?: string;
  translation?: { id: number; title: string };
  material_data?: KodikMaterial;
  screenshots?: string[];
  seasons?: Record<string, KodikSeason>;
  last_season?: number;
  episodes_count?: number;
}
interface KodikResponse {
  results?: KodikItem[];
  total?: number;
  next_page?: string | null;
  error?: string;
}

const fixUrl = (u: string) => (u.startsWith("//") ? `https:${u}` : u);
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function mapSeasons(raw: Record<string, KodikSeason> | undefined): SeasonInfo[] | null {
  if (!raw) return null;
  const out = Object.entries(raw)
    .map(([s, v]) => ({
      season: Number(s),
      url: v.link ? fixUrl(v.link) : undefined,
      episodes: Object.entries(v.episodes ?? {})
        .map(([n, e]) => ({ n: Number(n), url: fixUrl(typeof e === "string" ? e : e.link) }))
        .filter((e) => Number.isFinite(e.n) && e.url)
        .sort((a, b) => a.n - b.n),
    }))
    .filter((s) => Number.isFinite(s.season))
    .sort((a, b) => a.season - b.season);
  return out.length ? out : null;
}

export function toMovie(r: KodikItem): Movie | null {
  if (!r || !r.id || !r.title) return null;
  const md = r.material_data ?? {};
  const t = r.type ?? "";
  const category: Category = t.includes("anime")
    ? "anime-serials"
    : t.includes("cartoon")
      ? "cartoon"
      : t.includes("serial")
        ? "serials"
        : "films";

  const genres = unique((md.all_genres ?? md.anime_genres ?? md.genres ?? []).map(cap).filter((g) => g && g !== "Аниме"));
  const rawStatus = md.all_status ?? md.anime_status;
  const status = rawStatus === "released" ? "offline" : rawStatus === "ongoing" ? "online" : rawStatus === "anons" ? "announced" : null;
  const original = r.title_orig ?? md.title_en ?? "";
  const description = (md.description ?? md.anime_description ?? "").trim();
  const seasons = mapSeasons(r.seasons);

  return makeMovie({
    provider: "kodik",
    id: r.id,
    title: r.title,
    originalTitle: original && original !== r.title ? original : "",
    year: r.year ?? null,
    category,
    isSeries: t.includes("serial") || (r.episodes_count ?? 0) > 1,
    quality: r.quality ?? null,
    age: md.minimal_age ? `${md.minimal_age}+` : null,
    kp: positive(md.kinopoisk_rating),
    imdb: positive(md.imdb_rating),
    shiki: positive(md.shikimori_rating),
    poster: md.poster_url ?? md.anime_poster_url ?? null,
    screenshot: (r.screenshots ?? md.screenshots)?.[0] ?? null,
    player: r.link ? fixUrl(r.link) : "",
    description: description || null,
    descriptionFrom: description ? "kodik" : null,
    genres,
    countries: md.countries ?? [],
    voices: r.translation?.title ? [r.translation.title] : [],
    seasonsCount: r.last_season ?? null,
    episodesCount: r.episodes_count ?? null,
    seasons,
    duration: positive(md.duration),
    status,
    kinopoiskId: r.kinopoisk_id ?? null,
  });
}

/** Kodik returns one row per translation — keep one row per title. */
export function dedupe(items: KodikItem[]): KodikItem[] {
  const map = new Map<string, KodikItem>();
  for (const item of items) {
    const key = String(item.shikimori_id || item.kinopoisk_id || item.imdb_id || `${item.title}:${item.year ?? ""}`);
    const prev = map.get(key);
    if (!prev || (item.episodes_count ?? 0) > (prev.episodes_count ?? 0)) map.set(key, item);
  }
  return [...map.values()];
}

function buildUrl(p: ListParams): string {
  const q = new URLSearchParams({
    token: TOKEN,
    with_material_data: "true",
    limit: String(Math.min(p.size ?? 36, 100)),
  });
  const name = p.name?.trim();
  if (p.type) q.set("types", TYPES[p.type]);
  if (p.year) q.set("year", String(p.year));
  if (name) {
    q.set("title", name);
    return `${BASE}/search?${q}`;
  }
  q.set("sort", SORT[p.sort ?? "-views"]);
  q.set("order", p.sort === "id" ? "asc" : "desc");
  return `${BASE}/list?${q}`;
}

const pageCache = new Map<string, Promise<ListResult>>();
export function clearCache() {
  pageCache.clear();
}

function list(p: ListParams): Promise<ListResult> {
  const page = Math.max(p.page ?? 1, 1);
  const key = `${JSON.stringify([p.type, p.year, p.sort, p.name, p.size])}#${page}`;
  const hit = pageCache.get(key);
  if (hit) return hit;

  const promise = (async (): Promise<ListResult> => {
    if (p.name?.trim() && page > 1) return { items: [], total: 0, hasMore: false };

    let url: string;
    if (page === 1) {
      url = buildUrl(p);
    } else {
      const prev = await list({ ...p, page: page - 1 });
      if (!prev.next) return { items: [], total: prev.total, hasMore: false };
      url = prev.next;
    }

    const data = await getJson<KodikResponse>(url);
    if (data.error) throw new Error(data.error);
    const items = dedupe(data.results ?? [])
      .map(toMovie)
      .filter(nonNull)
      .filter((m) => m.poster);
    const next = data.next_page ? data.next_page.replace(/^http:/, "https:") : null;
    return { items, total: data.total ?? items.length, hasMore: Boolean(next), next };
  })();

  promise.catch(() => pageCache.delete(key));
  pageCache.set(key, promise);
  return promise;
}

async function find(id: string): Promise<Movie | null> {
  const q = new URLSearchParams({ token: TOKEN, id, with_material_data: "true", with_episodes: "true" });
  const data = await getJson<KodikResponse>(`${BASE}/search?${q}`);
  const item = data.results?.[0];
  return item ? toMovie(item) : null;
}

/** Episode links are heavy, so they are requested only for the movie page. */
async function hydrate(m: Movie): Promise<Movie> {
  const full = await find(m.id);
  if (!full) return m;
  return {
    ...m,
    seasons: full.seasons ?? m.seasons,
    episodesCount: full.episodesCount ?? m.episodesCount,
    screenshot: m.screenshot ?? full.screenshot,
  };
}

export const kodik: Provider = {
  id: "kodik",
  name: "Kodik",
  short: "Kodik",
  host: "kodikapi.com",
  tagline: "Аниме, кино и сериалы с выбором озвучки, описанием и рейтингом Shikimori.",
  accent: "from-fuchsia-300 to-violet-500",
  features: {
    descriptions: true,
    voices: true,
    episodes: true,
    serverGenre: false,
    popularSort: true,
    trendingByYear: false,
    sequential: true,
    pageSize: 36,
  },
  sorts: [
    { id: "-views", label: "Недавно обновлённые" },
    { id: "-kinopoisk", label: "По рейтингу КП" },
    { id: "-imdb", label: "По рейтингу IMDb" },
    { id: "-year", label: "По году выхода" },
  ],
  serverGenre: () => false,
  list,
  find,
  hydrate,
};
