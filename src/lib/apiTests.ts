import { hydrateMovie } from "./api";
import { getJson } from "./http";
import { clearCache as clearKodik } from "./providers/kodik";
import { clearCache as clearTetrix } from "./providers/tetrix";
import { getProvider } from "./providers/registry";
import type { ListParams, Movie, ProviderId } from "./types";

export type Verdict = "pass" | "warn";
export interface Outcome {
  verdict: Verdict;
  detail: string;
}
export interface TestDef {
  id: string;
  provider: ProviderId;
  title: string;
  endpoint: string;
  run: () => Promise<Outcome>;
}
export type TestState = "idle" | "queued" | "running" | "pass" | "warn" | "fail";
export interface TestResult {
  state: TestState;
  ms?: number;
  detail?: string;
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
const cover = (items: Movie[], pick: (m: Movie) => unknown) => pct(items.filter((m) => Boolean(pick(m))).length, items.length);

async function items(pid: ProviderId, params: ListParams): Promise<Movie[]> {
  return (await getProvider(pid).list(params)).items;
}

function catalog(pid: ProviderId, id: string, title: string, endpoint: string, params: ListParams): TestDef {
  return {
    id: `${pid}-${id}`,
    provider: pid,
    title,
    endpoint,
    run: async () => {
      const list = await items(pid, { size: 8, ...params });
      if (!list.length) throw new Error("Пустой ответ — API вернул 0 элементов");
      const poster = cover(list, (m) => m.poster);
      const player = cover(list, (m) => m.player);
      if (poster === 0 && player === 0) throw new Error("В ответе нет ни постеров, ни ссылок на плеер");
      return {
        verdict: poster >= 80 && player >= 80 ? "pass" : "warn",
        detail: `${list.length} шт. · постеры ${poster}% · плеер ${player}%`,
      };
    },
  };
}

function search(pid: ProviderId, endpoint: string, term: string): TestDef {
  return {
    id: `${pid}-search`,
    provider: pid,
    title: `Поиск «${term}»`,
    endpoint,
    run: async () => {
      const list = await items(pid, { name: term, size: 10 });
      if (!list.length) throw new Error("Поиск ничего не нашёл");
      const needle = term.toLowerCase();
      const hits = list.filter((m) => `${m.title} ${m.originalTitle}`.toLowerCase().includes(needle)).length;
      return {
        verdict: hits > 0 ? "pass" : "warn",
        detail: `${list.length} результатов · совпадений в названии: ${hits}`,
      };
    },
  };
}

function byYear(pid: ProviderId, endpoint: string, year: number): TestDef {
  return {
    id: `${pid}-year`,
    provider: pid,
    title: `Фильтр по году ${year}`,
    endpoint,
    run: async () => {
      const list = await items(pid, { type: "films", year, size: 10 });
      if (!list.length) throw new Error(`Нет фильмов за ${year} год`);
      const wrong = list.filter((m) => m.year !== year).length;
      return {
        verdict: wrong === 0 ? "pass" : "warn",
        detail: wrong === 0 ? `Все ${list.length} из ${year} года` : `${wrong} из ${list.length} не из ${year} года`,
      };
    },
  };
}

function pagination(pid: ProviderId, endpoint: string, cursor = false): TestDef {
  return {
    id: `${pid}-pages`,
    provider: pid,
    title: cursor ? "Пагинация (курсор)" : "Пагинация",
    endpoint,
    run: async () => {
      const p = getProvider(pid);
      const first = await p.list({ type: "films", size: 6, page: 1 });
      const second = await p.list({ type: "films", size: 6, page: 2 });
      if (!first.items.length) throw new Error("Первая страница пуста");
      if (!second.items.length) throw new Error("Вторая страница пуста");
      const seen = new Set(first.items.map((m) => m.id));
      const overlap = second.items.filter((m) => seen.has(m.id)).length;
      return {
        verdict: overlap === 0 ? "pass" : "warn",
        detail: overlap === 0 ? `Страницы не пересекаются · всего ${first.total.toLocaleString("ru-RU")}` : `Пересечений: ${overlap}`,
      };
    },
  };
}

const TESTS_TETRIX: TestDef[] = [
  catalog("tetrix", "films", "Каталог · фильмы", "GET /api/catalog?type=films", { type: "films" }),
  catalog("tetrix", "serials", "Каталог · сериалы", "GET /api/catalog?type=serials", { type: "serials" }),
  catalog("tetrix", "cartoon", "Каталог · мультфильмы", "GET /api/catalog?type=cartoon", { type: "cartoon" }),
  catalog("tetrix", "anime", "Каталог · аниме", "GET /api/catalog?genreId=40", { type: "anime-serials" }),
  search("tetrix", "GET /api/catalog?q=", "Матрица"),
  byYear("tetrix", "GET /api/catalog?year=", 2024),
  pagination("tetrix", "GET /api/catalog?page="),
  {
    id: "tetrix-desc",
    provider: "tetrix",
    title: "Описания и озвучки",
    endpoint: "GET /api/catalog · description, voiceAuthorsV2",
    run: async () => {
      const list = await items("tetrix", { type: "films", size: 10, year: 2024 });
      if (!list.length) throw new Error("Нет данных для проверки");
      const desc = cover(list, (m) => m.description);
      const voices = cover(list, (m) => m.voices.length);
      if (desc === 0) throw new Error("Описания отсутствуют");
      return { verdict: desc >= 80 ? "pass" : "warn", detail: `описания ${desc}% · озвучки ${voices}%` };
    },
  },
  {
    id: "tetrix-filters",
    provider: "tetrix",
    title: "Справочники фильтров",
    endpoint: "GET /api/filters",
    run: async () => {
      const data = await getJson<{ years?: unknown[]; genres?: unknown[]; countries?: unknown[] }>("https://tetrixfilm.ru/api/filters");
      const years = data.years?.length ?? 0;
      const genres = data.genres?.length ?? 0;
      if (!years || !genres) throw new Error("В справочниках нет годов или жанров");
      return { verdict: "pass", detail: `${years} лет · ${genres} жанров · ${data.countries?.length ?? 0} стран` };
    },
  },
];

const TESTS_EVLOEV: TestDef[] = [
  catalog("evloev", "films", "Список · фильмы", "GET /api/list?type=films", { type: "films", sort: "-views" }),
  catalog("evloev", "serials", "Список · сериалы", "GET /api/list?type=serials", { type: "serials", sort: "-views" }),
  catalog("evloev", "cartoon", "Список · мультфильмы", "GET /api/list?type=cartoon", { type: "cartoon", sort: "-views" }),
  {
    id: "evloev-anime",
    provider: "evloev",
    title: "Аниме с сезонами и сериями",
    endpoint: "GET /api/list?type=anime-serials",
    run: async () => {
      const list = await items("evloev", { type: "anime-serials", sort: "-views", size: 6 });
      if (!list.length) throw new Error("Пустой ответ");
      const withSeasons = list.filter((m) => m.seasons?.length).length;
      const episodes = list.reduce((n, m) => n + (m.episodesCount ?? 0), 0);
      return {
        verdict: withSeasons > 0 ? "pass" : "warn",
        detail: `сезоны у ${withSeasons} из ${list.length} · ${episodes} серий`,
      };
    },
  },
  search("evloev", "GET /api/list?name=", "Матрица"),
  byYear("evloev", "GET /api/list?year=", 2024),
  {
    id: "evloev-sort",
    provider: "evloev",
    title: "Сортировка по рейтингу",
    endpoint: "GET /api/list?sort=-kinopoisk",
    run: async () => {
      const list = await items("evloev", { type: "films", sort: "-kinopoisk", size: 6 });
      if (!list.length) throw new Error("Пустой ответ");
      const top = Math.max(...list.map((m) => m.kp ?? 0));
      if (top === 0) throw new Error("В ответе нет рейтингов Кинопоиска");
      return { verdict: top >= 8 ? "pass" : "warn", detail: `лучший рейтинг на странице: ${top.toFixed(1)}` };
    },
  },
  pagination("evloev", "GET /api/list?page="),
  {
    id: "evloev-fallback",
    provider: "evloev",
    title: "Описание из главного API",
    endpoint: "Fallback → TetrixFilm по названию и году",
    run: async () => {
      const list = await items("evloev", { type: "films", sort: "-views", year: 2024, size: 6 });
      if (!list.length) throw new Error("Нет данных для проверки");
      const own = cover(list, (m) => m.description);
      let found: Movie | null = null;
      for (const candidate of list.slice(0, 4)) {
        const enriched = await hydrateMovie(candidate);
        if (enriched.description) {
          found = enriched;
          break;
        }
      }
      if (!found) throw new Error("Ни для одного из проверенных фильмов не нашлось описания в TetrixFilm");
      return {
        verdict: "pass",
        detail: `свои описания ${own}% · для «${found.title}» описание получено из ${found.descriptionFrom === "tetrix" ? "TetrixFilm" : "источника"}`,
      };
    },
  },
];

const TESTS_KODIK: TestDef[] = [
  catalog("kodik", "films", "Список · фильмы", "GET /list?types=foreign-movie,russian-movie", { type: "films" }),
  catalog("kodik", "serials", "Список · сериалы", "GET /list?types=foreign-serial,russian-serial", { type: "serials" }),
  catalog("kodik", "cartoon", "Список · мультфильмы", "GET /list?types=foreign-cartoon,…", { type: "cartoon" }),
  catalog("kodik", "anime", "Список · аниме", "GET /list?types=anime,anime-serial", { type: "anime-serials" }),
  search("kodik", "GET /search?title=", "Наруто"),
  byYear("kodik", "GET /list?year=", 2024),
  pagination("kodik", "GET /list · next_page", true),
  {
    id: "kodik-material",
    provider: "kodik",
    title: "material_data: описание и озвучка",
    endpoint: "GET /list?with_material_data=true",
    run: async () => {
      const list = await items("kodik", { type: "anime-serials", size: 10 });
      if (!list.length) throw new Error("Нет данных для проверки");
      const desc = cover(list, (m) => m.description);
      const voices = cover(list, (m) => m.voices.length);
      if (desc === 0) throw new Error("material_data не содержит описаний");
      return { verdict: desc >= 60 ? "pass" : "warn", detail: `описания ${desc}% · озвучки ${voices}% · жанры ${cover(list, (m) => m.genres.length)}%` };
    },
  },
];

export const TESTS: TestDef[] = [...TESTS_TETRIX, ...TESTS_EVLOEV, ...TESTS_KODIK];
export const TEST_PROVIDERS: ProviderId[] = ["tetrix", "evloev", "kodik"];

function friendly(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/abort/i.test(msg)) return "Тайм-аут: сервер не ответил вовремя";
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return "Нет ответа: сеть недоступна или CORS блокирует запрос";
  return msg || "Неизвестная ошибка";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Тайм-аут: тест выполнялся слишком долго")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function runTest(t: TestDef): Promise<TestResult> {
  const started = performance.now();
  try {
    const out = await withTimeout(t.run(), 30000);
    return { state: out.verdict, ms: Math.round(performance.now() - started), detail: out.detail };
  } catch (e) {
    return { state: "fail", ms: Math.round(performance.now() - started), detail: friendly(e) };
  }
}

/** Drops adapter-level caches so every run measures the real network. */
export function resetCaches() {
  clearTetrix();
  clearKodik();
}
