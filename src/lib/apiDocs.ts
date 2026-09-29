import { nonNull } from "./http";
import { dedupe as dedupeKodik, toMovie as mapKodik } from "./providers/kodik";
import { toMovie as mapEvloev } from "./providers/evloev";
import { toMovie as mapTetrix } from "./providers/tetrix";
import type { Movie, ProviderId } from "./types";

export const EVLOEV_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
export const KODIK_TOKEN = "3bd0a27dfccd284c54f4889f4a7d6453";

/* ------------------------------------------------------------------ types */

export type ParamKind = "select" | "text" | "number";
export interface ParamOption {
  value: string;
  label: string;
}
export interface ParamDef {
  key: string;
  label: string;
  kind: ParamKind;
  options?: ParamOption[];
  placeholder?: string;
  def?: string;
  hint?: string;
}
export interface DocParam {
  name: string;
  type: string;
  desc: string;
  required?: boolean;
}
export type HttpMethod = "GET" | "POST" | "PUT";

export interface EndpointDef {
  id: string;
  provider: ProviderId;
  method: HttpMethod;
  base: string;
  path: string;
  fallback?: { base: string; path: string };
  title: string;
  summary: string;
  params: ParamDef[];
  fixed?: Record<string, string>;
  tryable: boolean;
  /** array inside the JSON response that holds the items */
  listKey?: string;
  titleKey?: string;
  imageKey?: string;
  jq?: string;
  docParams?: DocParam[];
  /** custom curl for endpoints that cannot be executed from the tester */
  example?: string;
}

export interface Preset {
  id: string;
  label: string;
  epId: string;
  values: Record<string, string>;
}

/* -------------------------------------------------------------- endpoints */

const opt = (value: string, label: string): ParamOption => ({ value, label });

const TETRIX_GENRES = [
  opt("", "Любой"),
  opt("1", "1 · Комедия"),
  opt("5", "5 · Мультфильм"),
  opt("7", "7 · Фантастика"),
  opt("8", "8 · Боевик"),
  opt("10", "10 · Драма"),
  opt("11", "11 · Ужасы"),
  opt("13", "13 · Триллер"),
  opt("15", "15 · Мелодрама"),
  opt("16", "16 · Детектив"),
  opt("40", "40 · Аниме"),
];

const KODIK_TYPES = [
  opt("foreign-movie,russian-movie", "Фильмы"),
  opt("foreign-serial,russian-serial", "Сериалы"),
  opt("foreign-cartoon,russian-cartoon,soviet-cartoon", "Мультфильмы"),
  opt("anime,anime-serial", "Аниме"),
];

const TETRIX = "https://tetrixfilm.ru";
const EVLOEV = "https://evloevfilmapi.vercel.app";
const KODIK = "https://kodikapi.com";

export const ENDPOINTS: EndpointDef[] = [
  {
    id: "tetrix-catalog",
    provider: "tetrix",
    method: "GET",
    base: TETRIX,
    path: "/api/catalog",
    title: "Каталог",
    summary: "Фильмы, сериалы, мультфильмы и аниме с описанием, рейтингами Кинопоиска, озвучками и ссылкой на плеер.",
    tryable: true,
    listKey: "data",
    titleKey: "title",
    imageKey: "posterUrl",
    jq: ".data[0] | {title, year, posterUrl, playerUrl}",
    params: [
      {
        key: "type",
        label: "Тип (type)",
        kind: "select",
        def: "films",
        options: [opt("", "Всё"), opt("films", "films · фильмы"), opt("serials", "serials · сериалы"), opt("cartoon", "cartoon · мультфильмы")],
      },
      { key: "q", label: "Поиск (q)", kind: "text", placeholder: "Например: Переводчик", hint: "Название или жанр" },
      { key: "year", label: "Год (year)", kind: "number", placeholder: "2025" },
      { key: "genreId", label: "Жанр (genreId)", kind: "select", options: TETRIX_GENRES },
      { key: "page", label: "Страница (page)", kind: "number", def: "1" },
      { key: "pageSize", label: "На странице (pageSize)", kind: "number", def: "3", hint: "от 1 до 100" },
    ],
  },
  {
    id: "tetrix-filters",
    provider: "tetrix",
    method: "GET",
    base: TETRIX,
    path: "/api/filters",
    title: "Справочники фильтров",
    summary: "Годы, языки, жанры, страны и типы контента. Ответ кэшируется на сервере — удобно для выпадающих списков.",
    tryable: true,
    params: [],
  },
  {
    id: "tetrix-health",
    provider: "tetrix",
    method: "GET",
    base: TETRIX,
    path: "/health",
    title: "Проверка доступности",
    summary: "Лёгкий запрос для мониторинга: возвращает { ok: true }, если сервер работает.",
    tryable: true,
    params: [],
  },
  {
    id: "tetrix-room-create",
    provider: "tetrix",
    method: "POST",
    base: TETRIX,
    path: "/api/rooms",
    title: "Создать комнату",
    summary: "Раздел «Посмотреть вместе». Возвращает код комнаты и секретный hostToken — он показывается только один раз.",
    tryable: false,
    params: [],
    docParams: [
      { name: "movie_id", type: "number", desc: "ID фильма в каталоге", required: true },
      { name: "movie_name", type: "string", desc: "Название для комнаты" },
      { name: "movie_iframe_url", type: "string", desc: "Ссылка на плеер", required: true },
      { name: "creator_id", type: "string", desc: "Идентификатор создателя" },
    ],
    example: `curl -X POST "${TETRIX}/api/rooms" \\
  -H "Content-Type: application/json" \\
  -d '{
    "movie_id": 632,
    "movie_name": "Переводчик",
    "movie_iframe_url": "https://player.example/iframe",
    "creator_id": "user-123"
  }'`,
  },
  {
    id: "tetrix-room-get",
    provider: "tetrix",
    method: "GET",
    base: TETRIX,
    path: "/api/rooms/{code}",
    title: "Получить комнату",
    summary: "Публичное состояние комнаты без секретного токена ведущего.",
    tryable: false,
    params: [],
    docParams: [{ name: "code", type: "string", desc: "Код комнаты, например 9F3A1C0B", required: true }],
    example: `curl "${TETRIX}/api/rooms/9F3A1C0B"`,
  },
  {
    id: "tetrix-room-state",
    provider: "tetrix",
    method: "PUT",
    base: TETRIX,
    path: "/api/rooms/{code}/state",
    title: "Состояние плеера",
    summary: "Только ведущий управляет воспроизведением: без заголовка X-Room-Host-Token сервер вернёт 403.",
    tryable: false,
    params: [],
    docParams: [
      { name: "X-Room-Host-Token", type: "header", desc: "Токен ведущего из ответа POST /api/rooms", required: true },
      { name: "is_playing", type: "boolean", desc: "Играет ли видео" },
      { name: "playback_time", type: "number", desc: "Позиция в секундах" },
    ],
    example: `curl -X PUT "${TETRIX}/api/rooms/9F3A1C0B/state" \\
  -H "Content-Type: application/json" \\
  -H "X-Room-Host-Token: <HOST_TOKEN>" \\
  -d '{ "is_playing": true, "playback_time": 842.4 }'`,
  },
  {
    id: "tetrix-room-messages",
    provider: "tetrix",
    method: "POST",
    base: TETRIX,
    path: "/api/rooms/{code}/messages",
    title: "Чат комнаты",
    summary: "GET отдаёт последние 100 сообщений, POST добавляет новое (1–500 символов).",
    tryable: false,
    params: [],
    docParams: [
      { name: "message", type: "string", desc: "Текст, от 1 до 500 символов", required: true },
      { name: "sender_nickname", type: "string", desc: "Имя отправителя" },
    ],
    example: `curl -X POST "${TETRIX}/api/rooms/9F3A1C0B/messages" \\
  -H "Content-Type: application/json" \\
  -d '{ "sender_nickname": "Гость", "message": "Начинаем!" }'`,
  },
  {
    id: "tetrix-room-events",
    provider: "tetrix",
    method: "GET",
    base: TETRIX,
    path: "/api/rooms/{code}/events",
    title: "События в реальном времени (SSE)",
    summary: "Поток Server-Sent Events: события playback и message приходят всем участникам мгновенно.",
    tryable: false,
    params: [],
    docParams: [{ name: "code", type: "string", desc: "Код комнаты", required: true }],
    example: `curl -N "${TETRIX}/api/rooms/9F3A1C0B/events"

# event: playback
# data: {"is_playing":true,"playback_time":842.4}`,
  },

  {
    id: "evloev-list",
    provider: "evloev",
    method: "GET",
    base: EVLOEV,
    path: "/api/list",
    fallback: { base: "https://api.bhcesh.me", path: "/list" },
    title: "Список",
    summary: "Классический каталог: качество, возрастные рейтинги, подборки, трейлеры и сезоны с сериями для аниме.",
    tryable: true,
    listKey: "results",
    titleKey: "name",
    imageKey: "poster",
    jq: ".results[0] | {name, year, poster, iframe_url}",
    fixed: { token: EVLOEV_TOKEN },
    params: [
      {
        key: "type",
        label: "Тип (type)",
        kind: "select",
        def: "films",
        options: [opt("", "Всё"), opt("films", "films"), opt("serials", "serials"), opt("cartoon", "cartoon"), opt("anime-serials", "anime-serials")],
      },
      {
        key: "sort",
        label: "Сортировка (sort)",
        kind: "select",
        def: "-views",
        options: [opt("-views", "-views · популярные"), opt("-kinopoisk", "-kinopoisk · рейтинг КП"), opt("-imdb", "-imdb · рейтинг IMDb"), opt("-year", "-year · новинки")],
      },
      { key: "name", label: "Поиск (name)", kind: "text", placeholder: "Например: Матрица" },
      { key: "year", label: "Год (year)", kind: "number", placeholder: "2024" },
      { key: "page", label: "Страница (page)", kind: "number", def: "1" },
      { key: "limit", label: "Лимит (limit)", kind: "number", def: "3" },
      {
        key: "join_seasons",
        label: "Склеивать сезоны",
        kind: "select",
        options: [opt("", "По умолчанию"), opt("false", "false · отдельно"), opt("true", "true · вместе")],
        hint: "Для сериалов",
      },
    ],
  },

  {
    id: "kodik-list",
    provider: "kodik",
    method: "GET",
    base: KODIK,
    path: "/list",
    title: "Список материалов",
    summary: "Кино, сериалы, мультфильмы и аниме с озвучками и подробной material_data. Пагинация — курсором next_page.",
    tryable: true,
    listKey: "results",
    titleKey: "title",
    jq: ".results[0] | {title, year, link, translation}",
    fixed: { token: KODIK_TOKEN, with_material_data: "true" },
    params: [
      { key: "types", label: "Типы (types)", kind: "select", def: KODIK_TYPES[3].value, options: KODIK_TYPES },
      { key: "year", label: "Год (year)", kind: "number", placeholder: "2024" },
      {
        key: "sort",
        label: "Сортировка (sort)",
        kind: "select",
        def: "updated_at",
        options: [
          opt("updated_at", "updated_at · обновлённые"),
          opt("created_at", "created_at · добавленные"),
          opt("year", "year · год"),
          opt("kinopoisk_rating", "kinopoisk_rating"),
          opt("imdb_rating", "imdb_rating"),
          opt("shikimori_rating", "shikimori_rating"),
        ],
      },
      { key: "order", label: "Порядок (order)", kind: "select", def: "desc", options: [opt("desc", "desc · по убыванию"), opt("asc", "asc · по возрастанию")] },
      { key: "limit", label: "Лимит (limit)", kind: "number", def: "3", hint: "1–100" },
    ],
  },
  {
    id: "kodik-search",
    provider: "kodik",
    method: "GET",
    base: KODIK,
    path: "/search",
    title: "Поиск",
    summary: "Поиск по названию либо по внешнему ID (Кинопоиск, IMDb, Shikimori). Одна строка результата — одна озвучка.",
    tryable: true,
    listKey: "results",
    titleKey: "title",
    jq: ".results[0] | {title, year, translation, link}",
    fixed: { token: KODIK_TOKEN, with_material_data: "true" },
    params: [
      { key: "title", label: "Название (title)", kind: "text", def: "Наруто", placeholder: "Например: Наруто" },
      { key: "kinopoisk_id", label: "ID Кинопоиска", kind: "number", placeholder: "326" },
      { key: "limit", label: "Лимит (limit)", kind: "number", def: "3" },
    ],
  },
  {
    id: "kodik-genres",
    provider: "kodik",
    method: "GET",
    base: KODIK,
    path: "/genres",
    title: "Жанры",
    summary: "Справочник жанров с количеством материалов — можно отфильтровать по типу.",
    tryable: true,
    listKey: "results",
    fixed: { token: KODIK_TOKEN },
    params: [{ key: "types", label: "Типы (types)", kind: "select", def: KODIK_TYPES[0].value, options: KODIK_TYPES }],
  },
  {
    id: "kodik-years",
    provider: "kodik",
    method: "GET",
    base: KODIK,
    path: "/years",
    title: "Годы",
    summary: "Сколько материалов вышло в каждом году — основа для фильтра по годам.",
    tryable: true,
    listKey: "results",
    fixed: { token: KODIK_TOKEN },
    params: [{ key: "types", label: "Типы (types)", kind: "select", def: KODIK_TYPES[1].value, options: KODIK_TYPES }],
  },
];

export const PRESETS: Preset[] = [
  { id: "p1", label: "Популярные фильмы", epId: "evloev-list", values: { type: "films", sort: "-views", limit: "4" } },
  { id: "p2", label: "Поиск «Переводчик»", epId: "tetrix-catalog", values: { type: "", q: "Переводчик", pageSize: "3" } },
  { id: "p3", label: "Сериалы 2025", epId: "tetrix-catalog", values: { type: "serials", year: "2025", pageSize: "3" } },
  { id: "p4", label: "Аниме через жанр", epId: "tetrix-catalog", values: { type: "", genreId: "40", pageSize: "3" } },
  { id: "p5", label: "Топ по рейтингу КП", epId: "evloev-list", values: { type: "films", sort: "-kinopoisk", limit: "4" } },
  { id: "p6", label: "Справочник фильтров", epId: "tetrix-filters", values: {} },
  { id: "p7", label: "Kodik · аниме", epId: "kodik-list", values: { limit: "3" } },
  { id: "p8", label: "Kodik · поиск «Наруто»", epId: "kodik-search", values: { title: "Наруто", limit: "3" } },
];

export interface ProviderInfo {
  base: string;
  auth: string;
  pagination: string;
  notes: string[];
}

export const PROVIDER_INFO: Record<ProviderId, ProviderInfo> = {
  tetrix: {
    base: TETRIX,
    auth: "Ключ не нужен — публичный GET",
    pagination: "page + pageSize (до 100)",
    notes: [
      "CORS открыт: запросы работают прямо из браузера.",
      "Сервер кэширует ответы на 60 секунд.",
      "Если q совпадает с названием жанра, поиск автоматически идёт по жанру.",
      "Каталог отдаётся от старых записей к новым — новинки на последних страницах.",
    ],
  },
  evloev: {
    base: EVLOEV,
    auth: "Параметр token в запросе",
    pagination: "page + limit",
    notes: [
      "Зеркало api.bhcesh.me подключается автоматически, если основной хост недоступен.",
      "Сортировка работает на сервере: популярность, рейтинги, год.",
      "Параметр genre сервер игнорирует, поэтому жанры фильтруются на клиенте.",
      "Для аниме в ответе есть сезоны и ссылки на каждую серию.",
    ],
  },
  kodik: {
    base: KODIK,
    auth: "Параметр token в запросе",
    pagination: "Курсор: next_page из предыдущего ответа",
    notes: [
      "Одна строка результата — одна озвучка, поэтому мы схлопываем дубли по ID.",
      "with_material_data добавляет описание, жанры, рейтинги и скриншоты.",
      "with_episodes добавляет ссылки на каждую серию — запрос тяжёлый.",
      "Ссылки на плеер начинаются с «//», мы добавляем https:.",
    ],
  },
};

/* ---------------------------------------------------------------- helpers */

export function defaultValues(ep: EndpointDef): Record<string, string> {
  return Object.fromEntries(ep.params.map((p) => [p.key, p.def ?? ""]));
}

export function buildUrl(ep: EndpointDef, values: Record<string, string>, useFallback = false): string {
  const q = new URLSearchParams();
  Object.entries(ep.fixed ?? {}).forEach(([k, v]) => q.set(k, v));
  ep.params.forEach((p) => {
    const v = (values[p.key] ?? "").trim();
    if (v) q.set(p.key, v);
  });
  const target = useFallback && ep.fallback ? ep.fallback : { base: ep.base, path: ep.path };
  const qs = q.toString();
  return `${target.base}${target.path}${qs ? `?${qs}` : ""}`;
}

export function buildUrls(ep: EndpointDef, values: Record<string, string>): string[] {
  const urls = [buildUrl(ep, values)];
  if (ep.fallback) urls.push(buildUrl(ep, values, true));
  return urls;
}

const short = (t: string) => `${t.slice(0, 4)}…${t.slice(-4)}`;

/** Access keys are shortened on screen; copying always uses the full value. */
export function maskSecrets(s: string): string {
  return s.split(EVLOEV_TOKEN).join(short(EVLOEV_TOKEN)).split(KODIK_TOKEN).join(short(KODIK_TOKEN));
}

export function docParamsOf(ep: EndpointDef): DocParam[] {
  if (ep.docParams) return ep.docParams;
  const out: DocParam[] = [];
  if (ep.fixed?.token) out.push({ name: "token", type: "string", desc: "Ключ доступа (подставляется автоматически)", required: true });
  ep.params.forEach((p) => {
    const type =
      p.kind === "select" ? (p.options ?? []).map((o) => o.value).filter(Boolean).slice(0, 4).join(" | ") || "string" : p.kind === "number" ? "number" : "string";
    out.push({ name: p.key, type: type.length > 46 ? `${type.slice(0, 44)}…` : type, desc: p.hint ? `${p.label} — ${p.hint}` : p.label });
  });
  return out;
}

export type SnippetLang = "bash" | "js" | "py";

export function snippetFor(lang: SnippetLang, ep: EndpointDef, url: string): string {
  const key = ep.listKey;
  const title = ep.titleKey ?? "title";
  const img = ep.imageKey ?? "poster";

  if (lang === "bash") {
    return `curl -s "${url}"${ep.jq ? ` \\\n  | jq '${ep.jq}'` : ""}`;
  }
  if (lang === "js") {
    const tail = key
      ? `const json = await response.json();
const first = json.${key}[0];
console.log(first.${title}, first.${img});`
      : `const json = await response.json();
console.log(Object.keys(json));`;
    return `const response = await fetch(
  "${url}"
);
if (!response.ok) throw new Error("API error: " + response.status);

${tail}`;
  }
  const tail = key
    ? `items = response.json().get("${key}", [])
for item in items:
    print(item["${title}"], item.get("year"))`
    : `print(response.json())`;
  return `import requests

response = requests.get(
    "${url}",
    timeout=15,
)
response.raise_for_status()

${tail}`;
}

/* ---------------------------------------------------------------- running */

export interface RawResult {
  ok: boolean;
  status: number;
  statusText: string;
  ms: number;
  bytes: number;
  url: string;
  json: unknown;
  text: string | null;
  error?: string;
}

async function runOne(url: string): Promise<RawResult> {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      ms: Math.round(performance.now() - started),
      bytes: new Blob([text]).size,
      url,
      json,
      text: json === null ? text.slice(0, 3000) : null,
    };
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return {
      ok: false,
      status: 0,
      statusText: "",
      ms: Math.round(performance.now() - started),
      bytes: 0,
      url,
      json: null,
      text: null,
      error: aborted ? "Тайм-аут: сервер не ответил за 20 секунд." : "Нет ответа: сеть недоступна или запрос заблокирован политикой CORS.",
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Tries each URL in order; moves on only when the host is unreachable or answers with a 5xx. */
export async function runRequest(urls: string[]): Promise<RawResult> {
  let last: RawResult | null = null;
  for (const url of urls) {
    last = await runOne(url);
    if (last.status > 0 && last.status < 500) return last;
  }
  return last as RawResult;
}

/* ----------------------------------------------------------- normalization */

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** The raw items of a response, in the order the adapter sees them. */
export function rawItems(ep: EndpointDef, json: unknown): unknown[] {
  if (!json || typeof json !== "object" || !ep.listKey) return [];
  const list = arr((json as Record<string, unknown>)[ep.listKey]);
  return ep.provider === "kodik" ? dedupeKodik(list as Parameters<typeof dedupeKodik>[0]) : list;
}

export function normalizeResponse(ep: EndpointDef, json: unknown): Movie[] | null {
  const raw = rawItems(ep, json);
  if (!raw.length) return null;
  switch (ep.id) {
    case "tetrix-catalog":
      return raw.map((x) => mapTetrix(x as Parameters<typeof mapTetrix>[0])).filter(nonNull);
    case "evloev-list":
      return raw.map((x) => mapEvloev(x as Parameters<typeof mapEvloev>[0])).filter(nonNull);
    case "kodik-list":
    case "kodik-search":
      return raw.map((x) => mapKodik(x as Parameters<typeof mapKodik>[0])).filter(nonNull);
    default:
      return null;
  }
}

export interface Summary {
  count: number | null;
  total: number | null;
  noun: string;
}

export function summarize(ep: EndpointDef, json: unknown): Summary {
  if (json === null || typeof json !== "object") return { count: null, total: null, noun: "" };
  const obj = json as Record<string, unknown>;
  const meta = obj.meta as Record<string, unknown> | undefined;
  const total = typeof meta?.total === "number" ? meta.total : typeof obj.total === "number" ? obj.total : null;
  if (ep.listKey && Array.isArray(obj[ep.listKey])) return { count: (obj[ep.listKey] as unknown[]).length, total, noun: "элементов" };
  if (Array.isArray(json)) return { count: json.length, total, noun: "элементов" };
  return { count: Object.keys(obj).length, total, noun: "полей" };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} Б`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`;
  return `${(n / 1024 / 1024).toFixed(2)} МБ`;
}
