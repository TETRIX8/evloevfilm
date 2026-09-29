import { getJson, nonNull, positive, unique } from "../http";
import { makeMovie, type Category, type ListParams, type ListResult, type Movie, type Provider } from "../types";

/**
 * Main API — https://tetrixfilm.ru/docs
 * GET /api/catalog?type=films|serials|cartoon&q&year&genreId&page&pageSize
 */
const API = "https://tetrixfilm.ru/api/catalog";

const TYPE_PARAM: Record<Category, string | null> = {
  films: "films",
  serials: "serials",
  cartoon: "cartoon",
  "anime-serials": null, // anime is a genre (id 40) in this catalog
};

const GENRE_IDS: Record<string, number> = {
  "Комедия": 1,
  "Семейный": 2,
  "Приключения": 3,
  "Криминал": 6,
  "Фантастика": 7,
  "Боевик": 8,
  "Фэнтези": 9,
  "Драма": 10,
  "Ужасы": 11,
  "Документальный": 12,
  "Триллер": 13,
  "Мелодрама": 15,
  "Детектив": 16,
  "Военный": 17,
  "Исторический": 20,
};
const ANIME_GENRE_ID = 40;
const HIDDEN_GENRES = new Set(["Эксклюзив", "Кино", "Все обо всем", "Аниме"]);

interface VeoNamed {
  id: number;
  name: string;
}
interface VeoRating {
  rating?: number;
  votes?: number;
}
interface VeoItem {
  id: number;
  title: string;
  originalTitle?: string | null;
  description?: string | null;
  year?: number | null;
  kinopoiskId?: number | null;
  contentType?: { id?: number } | null;
  ratings?: { kinopoisk?: VeoRating; imdb?: VeoRating } | null;
  genres?: VeoNamed[] | null;
  countries?: VeoNamed[] | null;
  posterUrl?: string | null;
  voiceAuthorsV2?: VeoNamed[] | null;
  seasonsCount?: number | null;
  episodesCount?: number | null;
  episodesBySeason?: Record<string, number> | null;
  playerUrl?: string | null;
}
interface VeoResponse {
  data?: VeoItem[];
  meta?: { page: number; total: number; hasNextPage: boolean; pageSize: number; pages: number };
}

export function toMovie(r: VeoItem): Movie | null {
  if (!r || typeof r.id !== "number" || !r.title) return null;
  const typeId = r.contentType?.id;
  const genreNames = (r.genres ?? []).map((g) => g.name);

  let category: Category = "films";
  if (typeId === 11 || genreNames.includes("Аниме")) category = "anime-serials";
  else if (typeId === 2 || typeId === 5) category = "serials";
  else if (typeId === 10 || typeId === 12) category = "cartoon";

  const seasons = positive(r.seasonsCount);
  const episodes = positive(r.episodesCount);
  const seasonCounts = Object.entries(r.episodesBySeason ?? {})
    .map(([season, count]) => ({ season: Number(season), count: Number(count) }))
    .filter((s) => s.season > 0 && s.count > 0)
    .sort((a, b) => a.season - b.season);

  const voices = unique(
    (r.voiceAuthorsV2 ?? [])
      .map((v) => v.name)
      .filter((n) => n && n.toLowerCase() !== "unknown" && !/^track\s*\d/i.test(n)),
  );

  return makeMovie({
    provider: "tetrix",
    id: String(r.id),
    title: r.title,
    originalTitle: r.originalTitle?.trim() || "",
    year: r.year ?? null,
    category,
    isSeries: category === "serials" || (seasons ?? 0) > 1 || (episodes ?? 0) > 1,
    kp: positive(r.ratings?.kinopoisk?.rating),
    kpVotes: positive(r.ratings?.kinopoisk?.votes),
    imdb: positive(r.ratings?.imdb?.rating),
    poster: r.posterUrl ?? null,
    player: r.playerUrl ?? "",
    description: r.description?.trim() || null,
    descriptionFrom: r.description?.trim() ? "tetrix" : null,
    genres: genreNames.filter((g) => !HIDDEN_GENRES.has(g)),
    countries: (r.countries ?? []).map((c) => c.name),
    voices,
    seasonsCount: seasons,
    episodesCount: episodes,
    seasonCounts,
    kinopoiskId: r.kinopoiskId ? String(r.kinopoiskId) : null,
  });
}

function url(base: URLSearchParams, page: number, size: number): string {
  const q = new URLSearchParams(base);
  q.set("page", String(page));
  q.set("pageSize", String(size));
  return `${API}?${q}`;
}

function toResult(res: VeoResponse, size: number): ListResult {
  const items = (res.data ?? []).map(toMovie).filter(nonNull);
  return {
    items,
    total: res.meta?.total ?? items.length,
    hasMore: res.meta?.hasNextPage ?? items.length >= size,
  };
}

/** The catalog is ordered by id ascending, so the newest titles live on the last page. */
const pagesCache = new Map<string, Promise<number>>();
export function clearCache() {
  pagesCache.clear();
}
function totalPages(base: URLSearchParams, size: number): Promise<number> {
  const key = `${base}|${size}`;
  let hit = pagesCache.get(key);
  if (!hit) {
    hit = getJson<VeoResponse>(url(base, 1, 1)).then((r) => Math.max(1, Math.ceil((r.meta?.total ?? 0) / size)));
    hit.catch(() => pagesCache.delete(key));
    pagesCache.set(key, hit);
  }
  return hit;
}

async function list(p: ListParams): Promise<ListResult> {
  const size = Math.min(Math.max(p.size ?? 24, 1), 100);
  const page = Math.max(p.page ?? 1, 1);

  const base = new URLSearchParams();
  const type = p.type ? TYPE_PARAM[p.type] : null;
  if (type) base.set("type", type);
  if (p.year) base.set("year", String(p.year));

  const genreIds: number[] = [];
  if (p.type === "anime-serials") genreIds.push(ANIME_GENRE_ID);
  else if (p.genre && GENRE_IDS[p.genre]) genreIds.push(GENRE_IDS[p.genre]);
  if (genreIds.length) base.set("genreId", genreIds.join(","));

  const query = p.name?.trim();
  if (query) base.set("q", query);

  const newestFirst = p.sort !== "id" && !query;
  if (!newestFirst) {
    return toResult(await getJson<VeoResponse>(url(base, page, size)), size);
  }

  const pages = await totalPages(base, size);
  const actual = pages - page + 1;
  if (actual < 1) return { items: [], total: 0, hasMore: false };

  const res = toResult(await getJson<VeoResponse>(url(base, actual, size)), size);
  return { items: [...res.items].reverse(), total: res.total, hasMore: actual > 1 };
}

async function find(id: string, title?: string): Promise<Movie | null> {
  if (!title) return null;
  const res = await list({ name: title, size: 40 });
  return res.items.find((m) => m.id === id) ?? null;
}

export const tetrix: Provider = {
  id: "tetrix",
  name: "TetrixFilm API",
  short: "Tetrix",
  host: "tetrixfilm.ru",
  recommended: true,
  tagline: "Главный каталог: описания, озвучки, сезоны и серии, рейтинги Кинопоиска.",
  accent: "from-gold-300 to-gold-600",
  features: {
    descriptions: true,
    voices: true,
    episodes: false,
    serverGenre: true,
    popularSort: false,
    trendingByYear: true,
    sequential: false,
    pageSize: 36,
  },
  sorts: [
    { id: "-views", label: "Сначала новые" },
    { id: "id", label: "Сначала старые" },
  ],
  serverGenre: (category) => category !== "anime-serials",
  list,
  find,
};
