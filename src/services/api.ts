const LEGACY_API_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const LEGACY_BASE_URL = "https://evloevfilmapi.vercel.app/api/list";
const CATALOG_BASE_URL = import.meta.env.VITE_CATALOG_API_URL || "/api";

export interface VeoNamedItem {
  id: number;
  name: string;
  slug?: string | null;
}

export interface VeoRating {
  rating?: number;
  votes?: number;
}

export interface VeoContent {
  id: number;
  title: string;
  originalTitle?: string;
  description?: string;
  year?: number;
  kinopoiskId?: number;
  imdbId?: string;
  contentType?: { id?: number; name?: string; slug?: string };
  ratings?: { kinopoisk?: VeoRating; imdb?: VeoRating };
  genres?: VeoNamedItem[];
  countries?: VeoNamedItem[];
  createdAt?: string;
  updatedAt?: string;
  posterUrl?: string;
  voiceAuthors?: string;
  voiceAuthorsV2?: VeoNamedItem[];
  audioTracks?: string;
  seasonsCount?: number;
  episodesCount?: number;
  episodesBySeason?: Record<string, number>;
  episodesByVoiceAuthors?: unknown[];
  playerUrl?: string;
}

interface VeoCatalogResponse {
  data?: VeoContent[];
  results?: VeoContent[];
  total?: number;
  pagination?: unknown;
}

interface LegacyMovie {
  id: number;
  name: string;
  poster: string;
  iframe_url: string;
  description?: string;
  year?: number;
  rating?: number;
  genres?: string[];
  kinopoisk_id?: string;
  trailer?: string;
}

interface LegacyResponse {
  total?: number;
  results?: LegacyMovie[];
}

export interface MovieData {
  id?: number;
  title: string;
  originalTitle?: string;
  image: string;
  link: string;
  year?: number;
  rating?: number;
  kinopoisk_rating?: number;
  kinopoisk_votes?: number;
  imdb_rating?: number;
  description?: string;
  genres?: string[];
  countries?: string[];
  kinopoisk_id?: string;
  imdb_id?: string;
  seasons_count?: number;
  episodes_count?: number;
  voice_authors?: string;
}

export interface MovieDetails extends MovieData {
  trailer?: string;
  iframe_url: string;
  poster: string;
}

interface FetchOptions {
  sort?: string;
  limit?: number;
}

function mapVeoContent(item: VeoContent): MovieData {
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.originalTitle,
    image: item.posterUrl || "/placeholder.svg",
    link: item.playerUrl || "",
    year: item.year,
    rating: item.ratings?.kinopoisk?.rating,
    kinopoisk_rating: item.ratings?.kinopoisk?.rating,
    kinopoisk_votes: item.ratings?.kinopoisk?.votes,
    imdb_rating: item.ratings?.imdb?.rating,
    description: item.description,
    genres: item.genres?.map((genre) => genre.name).filter(Boolean) as string[] | undefined,
    countries: item.countries?.map((country) => country.name).filter(Boolean) as string[] | undefined,
    kinopoisk_id: item.kinopoiskId ? String(item.kinopoiskId) : undefined,
    imdb_id: item.imdbId,
    seasons_count: item.seasonsCount,
    episodes_count: item.episodesCount,
    voice_authors: item.voiceAuthors,
  };
}

function mapLegacyMovie(item: LegacyMovie): MovieData {
  return {
    id: item.id,
    title: item.name,
    image: item.poster,
    link: item.iframe_url,
    year: item.year,
    rating: item.rating,
    kinopoisk_rating: item.rating,
    description: item.description,
    genres: item.genres,
    kinopoisk_id: item.kinopoisk_id,
  };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers || {}) },
    credentials: "omit",
  });
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return response.json() as Promise<T>;
}

async function fetchVeoCatalog(params: Record<string, string>): Promise<MovieData[]> {
  const url = new URL(`${CATALOG_BASE_URL}/catalog`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => value && url.searchParams.set(key, value));
  const payload = await requestJson<VeoCatalogResponse>(url.toString());
  const items = payload.data || payload.results || [];
  return items.map(mapVeoContent);
}

async function fetchLegacy(params: Record<string, string>): Promise<MovieData[]> {
  const url = new URL(LEGACY_BASE_URL);
  url.searchParams.set("token", LEGACY_API_TOKEN);
  Object.entries(params).forEach(([key, value]) => value && url.searchParams.set(key, value));
  const payload = await requestJson<LegacyResponse>(url.toString());
  return (payload.results || []).map(mapLegacyMovie);
}

async function withFallback(primary: () => Promise<MovieData[]>, fallback: () => Promise<MovieData[]>): Promise<MovieData[]> {
  try {
    const result = await primary();
    if (result.length) return result;
  } catch (error) {
    console.warn("VeoVeo request failed; using auxiliary movie API", error);
  }
  return fallback();
}

export async function fetchMovieDetails(title: string): Promise<MovieDetails | null> {
  if (!title) return null;
  const items = await withFallback(
    () => fetchVeoCatalog({ q: title, pageSize: "10", type: "films" }),
    () => fetchLegacy({ name: title, limit: "1" }),
  );
  const movie = items[0];
  if (!movie || !movie.link) return null;
  const poster = movie.image !== "/placeholder.svg" ? movie.image : await fetchPosterFallback(movie.title);
  return { ...movie, image: poster || "/placeholder.svg", iframe_url: movie.link, poster: poster || "/placeholder.svg" };
}

export async function fetchMovies(type: "films" | "serials" | "cartoon", year = "", options: FetchOptions = {}): Promise<MovieData[]> {
  const limit = String(options.limit || 50);
  return withFallback(
    () => fetchVeoCatalog({ type, year, pageSize: limit }),
    () => fetchLegacy({ sort: options.sort || "-views", type, limit, year, ...(type === "serials" ? { join_seasons: "false" } : {}) }),
  );
}

export async function searchMovies(searchTerm: string): Promise<MovieData[]> {
  if (!searchTerm.trim()) return [];
  return withFallback(
    () => fetchVeoCatalog({ q: searchTerm.trim(), pageSize: "30" }),
    () => fetchLegacy({ name: searchTerm.trim() }),
  );
}

export async function fetchPosterFallback(title: string): Promise<string | null> {
  if (!title.trim()) return null;
  try {
    const movies = await fetchLegacy({ name: title.trim(), limit: "1" });
    return movies[0]?.image || null;
  } catch (error) {
    console.warn("Auxiliary poster lookup failed", error);
    return null;
  }
}

export async function fetchMovieFilters(): Promise<unknown> {
  return requestJson(`${CATALOG_BASE_URL}/filters`);
}
