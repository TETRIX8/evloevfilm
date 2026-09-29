import { getJson, nonNull, positive } from "../http";
import { makeMovie, type Category, type ListParams, type ListResult, type Movie, type Provider, type SeasonInfo } from "../types";

/** EvloevFilm legacy list API (proxy of api.bhcesh.me). */
const TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const ENDPOINTS = ["https://evloevfilmapi.vercel.app/api/list", "https://api.bhcesh.me/list"];
const HIDDEN_GENRES = new Set(["Зарубежный", "Блокбастер", "Русский"]);

interface RawEpisode {
  episode: number;
  iframe_url?: string | null;
}
interface RawSeason {
  season: number;
  iframe_url?: string | null;
  episodes?: RawEpisode[] | null;
}
interface RawItem {
  id: number;
  name: string;
  type?: string | null;
  age?: string | null;
  quality?: string | null;
  origin_name?: string | null;
  year?: number | null;
  kinopoisk?: string | null;
  kinopoisk_id?: string | null;
  imdb?: string | null;
  iframe_url?: string | null;
  trailer?: string | null;
  poster?: string | null;
  genre?: Record<string, string> | null;
  country?: Record<string, string> | null;
  collection?: Record<string, string> | null;
  serial_status?: string | null;
  seasons?: RawSeason[] | null;
}
interface RawResponse {
  total?: number;
  results?: RawItem[];
}

function categoryOf(type: string): Category {
  const t = type.toLowerCase();
  if (t.startsWith("anime")) return "anime-serials";
  if (t.startsWith("cartoon")) return "cartoon";
  if (t.includes("serial") || t.includes("series")) return "serials";
  return "films";
}

function mapSeasons(raw: RawSeason[] | null | undefined): SeasonInfo[] | null {
  if (!raw?.length) return null;
  const out = raw
    .map((s) => ({
      season: s.season,
      url: s.iframe_url ?? undefined,
      episodes: (s.episodes ?? [])
        .filter((e) => e.iframe_url)
        .map((e) => ({ n: e.episode, url: e.iframe_url as string })),
    }))
    .sort((a, b) => a.season - b.season);
  return out.length ? out : null;
}

export function toMovie(r: RawItem): Movie | null {
  if (!r || typeof r.id !== "number" || !r.name) return null;
  const type = r.type ?? "film";
  const t = type.toLowerCase();
  const seasons = mapSeasons(r.seasons);
  return makeMovie({
    provider: "evloev",
    id: String(r.id),
    title: r.name,
    originalTitle: r.origin_name?.trim() || "",
    year: r.year ?? null,
    category: categoryOf(type),
    isSeries: t.includes("serial") || t.includes("series"),
    quality: r.quality ?? null,
    age: r.age ?? null,
    kp: positive(r.kinopoisk),
    imdb: positive(r.imdb),
    poster: r.poster ?? null,
    player: r.iframe_url ?? "",
    trailer: r.trailer ?? null,
    genres: Object.values(r.genre ?? {}).filter((g) => !HIDDEN_GENRES.has(g)),
    countries: Object.values(r.country ?? {}),
    collections: Object.values(r.collection ?? {}),
    status: r.serial_status ?? null,
    seasons,
    seasonsCount: seasons?.length ?? null,
    episodesCount: seasons ? seasons.reduce((n, s) => n + s.episodes.length, 0) || null : null,
    kinopoiskId: r.kinopoisk_id ?? null,
  });
}

async function request(qs: string): Promise<RawResponse> {
  let lastError: unknown;
  for (const base of ENDPOINTS) {
    try {
      return await getJson<RawResponse>(`${base}?${qs}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Network error");
}

async function list(p: ListParams): Promise<ListResult> {
  const size = p.size ?? 40;
  const params: Record<string, string> = { token: TOKEN, limit: String(size) };
  if (p.type) params.type = p.type;
  if (p.year) params.year = String(p.year);
  if (p.sort && p.sort !== "id") params.sort = p.sort;
  if (p.name?.trim()) params.name = p.name.trim();
  if (p.page && p.page > 1) params.page = String(p.page);
  if (p.type === "serials" || p.type === "anime-serials") params.join_seasons = "false";

  const payload = await request(new URLSearchParams(params).toString());
  const items = (payload.results ?? []).map(toMovie).filter(nonNull);
  const total = payload.total ?? items.length;
  const page = p.page ?? 1;
  return { items, total, hasMore: items.length > 0 && page * size < total };
}

async function find(id: string, title?: string): Promise<Movie | null> {
  if (!title) return null;
  const res = await list({ name: title, size: 30 });
  return res.items.find((m) => m.id === id) ?? null;
}

export const evloev: Provider = {
  id: "evloev",
  name: "EvloevFilm API",
  short: "Evloev",
  host: "evloevfilmapi.vercel.app",
  tagline: "Классический каталог: качество, возрастные рейтинги, подборки и трейлеры.",
  accent: "from-sky-300 to-indigo-500",
  features: {
    descriptions: false,
    voices: false,
    episodes: true,
    serverGenre: false,
    popularSort: true,
    trendingByYear: false,
    sequential: false,
    pageSize: 40,
  },
  sorts: [
    { id: "-views", label: "Популярные" },
    { id: "-kinopoisk", label: "По рейтингу КП" },
    { id: "-imdb", label: "По рейтингу IMDb" },
    { id: "-year", label: "Новинки" },
  ],
  serverGenre: () => false,
  list,
  find,
};
