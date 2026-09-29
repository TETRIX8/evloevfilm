export type ProviderId = "tetrix" | "evloev" | "kodik";
export type Category = "films" | "serials" | "cartoon" | "anime-serials";
export type SortKey = "-views" | "-kinopoisk" | "-imdb" | "-year" | "id";

export interface EpisodeLink {
  n: number;
  url: string;
}

export interface SeasonInfo {
  season: number;
  url?: string;
  episodes: EpisodeLink[];
}

export interface SeasonCount {
  season: number;
  count: number;
}

export interface Movie {
  /** `${provider}:${id}` — unique across every API */
  key: string;
  provider: ProviderId;
  id: string;
  title: string;
  originalTitle: string;
  year: number | null;
  category: Category;
  isSeries: boolean;
  quality: string | null;
  age: string | null;
  kp: number | null;
  kpVotes: number | null;
  imdb: number | null;
  shiki: number | null;
  poster: string | null;
  screenshot: string | null;
  player: string;
  trailer: string | null;
  description: string | null;
  descriptionFrom: ProviderId | null;
  genres: string[];
  countries: string[];
  collections: string[];
  voices: string[];
  seasonsCount: number | null;
  episodesCount: number | null;
  seasonCounts: SeasonCount[];
  seasons: SeasonInfo[] | null;
  duration: number | null;
  status: string | null;
  kinopoiskId: string | null;
  hydrated?: boolean;
}

export function makeMovie(p: Partial<Movie> & Pick<Movie, "provider" | "id" | "title">): Movie {
  return {
    key: `${p.provider}:${p.id}`,
    originalTitle: "",
    year: null,
    category: "films",
    isSeries: false,
    quality: null,
    age: null,
    kp: null,
    kpVotes: null,
    imdb: null,
    shiki: null,
    poster: null,
    screenshot: null,
    player: "",
    trailer: null,
    description: null,
    descriptionFrom: null,
    genres: [],
    countries: [],
    collections: [],
    voices: [],
    seasonsCount: null,
    episodesCount: null,
    seasonCounts: [],
    seasons: null,
    duration: null,
    status: null,
    kinopoiskId: null,
    ...p,
  };
}

export interface ListParams {
  type?: Category;
  year?: number | string;
  sort?: SortKey;
  name?: string;
  page?: number;
  genre?: string;
  size?: number;
}

export interface ListResult {
  items: Movie[];
  total: number;
  hasMore?: boolean;
  next?: string | null;
}

export interface ProviderFeatures {
  descriptions: boolean;
  voices: boolean;
  episodes: boolean;
  serverGenre: boolean;
  /** true when the API itself can order by popularity */
  popularSort: boolean;
  /** true when "trending" has to be built from the current year */
  trendingByYear: boolean;
  /** pages must be requested one after another (cursor pagination) */
  sequential: boolean;
  pageSize: number;
}

export interface SortOption {
  id: SortKey;
  label: string;
}

export interface Provider {
  id: ProviderId;
  name: string;
  short: string;
  host: string;
  tagline: string;
  accent: string;
  recommended?: boolean;
  features: ProviderFeatures;
  sorts: SortOption[];
  serverGenre(category?: Category): boolean;
  list(p: ListParams): Promise<ListResult>;
  find(id: string, title?: string): Promise<Movie | null>;
  hydrate?(m: Movie): Promise<Movie>;
}
