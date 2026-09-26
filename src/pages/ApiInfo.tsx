import { useState } from "react";
import { Activity, ArrowRight, CheckCircle2, ChevronRight, Code2, Copy, Database, Filter, Gauge, GitBranch, HelpCircle, Radio, RefreshCw, Search, Server, ShieldCheck, Terminal, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/navigation/Navigation";
import { SEO } from "@/components/SEO";

const API_ORIGIN = "https://tetrixfilm.ru";
const catalogExample = `${API_ORIGIN}/api/catalog?type=films&pageSize=3`;

const catalogParams = [
  ["type", "films | serials | cartoon", "Тип контента. Необязательный параметр."],
  ["q", "переводчик", "Поиск по названию, оригинальному названию или жанру."],
  ["page", "1", "Номер страницы. По умолчанию 1."],
  ["pageSize", "20", "Количество результатов: от 1 до 100. По умолчанию 20."],
  ["year", "2024,2025", "Один или несколько годов через запятую."],
  ["genreId", "8,13", "ID жанров через запятую."],
  ["countryId", "10", "ID стран через запятую."],
  ["languageId", "2", "ID языков через запятую."],
];

const responseFields = [
  ["id", "number", "Уникальный ID контента."],
  ["title", "string", "Название на русском языке."],
  ["originalTitle", "string", "Оригинальное название, если есть."],
  ["description", "string", "Описание сюжета."],
  ["year", "number", "Год выпуска."],
  ["posterUrl", "string", "URL постера."],
  ["ratings", "object", "Рейтинги Kinopoisk и IMDb с количеством голосов."],
  ["genres", "array", "Жанры с ID, названием и slug."],
  ["countries", "array", "Страны производства."],
  ["contentType", "object", "Тип: фильм, сериал или мультфильм."],
  ["playerUrl", "string", "Ссылка на плеер контента."],
  ["voiceAuthors", "string", "Доступные авторы озвучки."],
  ["seasonsCount", "number", "Количество сезонов для сериалов."],
  ["episodesCount", "number", "Количество эпизодов."],
];

const roomEndpoints = [
  ["POST", "/api/rooms", "Создать комнату совместного просмотра."],
  ["GET", "/api/rooms/:code", "Получить публичные данные комнаты."],
  ["GET", "/api/rooms/:code/state", "Получить состояние плеера."],
  ["PUT", "/api/rooms/:code/state", "Изменить состояние плеера. Только ведущий."],
  ["GET", "/api/rooms/:code/messages", "Получить последние сообщения."],
  ["POST", "/api/rooms/:code/messages", "Отправить сообщение в чат."],
  ["GET", "/api/rooms/:code/events", "Открыть SSE-поток событий комнаты."],
];

function CodeBlock({ children, language = "json" }: { children: string; language?: string }) {
  return <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090b0f]"><span className="absolute right-4 top-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{language}</span><pre className="overflow-x-auto p-5 pt-10 text-xs leading-6 text-primary/90"><code>{children}</code></pre></div>;
}

function DocSection({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-28 border-t border-white/[0.08] py-12 first:border-t-0"><p className="section-eyebrow">{eyebrow}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2><div className="mt-6">{children}</div></section>;
}

function ApiTable({ rows, headers }: { rows: string[][]; headers: string[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-white/[0.08]"><div className="min-w-[650px]"><div className="grid grid-cols-[1.1fr_1fr_2fr] border-b border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">{headers.map((header) => <span key={header}>{header}</span>)}</div>{rows.map((row, index) => <div key={`${row[0]}-${index}`} className="grid grid-cols-[1.1fr_1fr_2fr] gap-3 border-b border-white/[0.06] px-4 py-4 text-xs last:border-0"><span className="font-bold text-primary">{row[0]}</span><span className="font-mono text-foreground/80">{row[1]}</span><span className="leading-5 text-muted-foreground">{row[2]}</span></div>)}</div></div>;
}

export default function ApiInfo() {
  const [testUrl, setTestUrl] = useState("/api/catalog?type=films&pageSize=3");
  const [testResult, setTestResult] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function runTest() {
    setTestStatus("loading");
    setTestResult("");
    try {
      const response = await fetch(testUrl.startsWith("http") ? testUrl : `${API_ORIGIN}${testUrl}`);
      const text = await response.text();
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch { /* keep plain response */ }
      setTestResult(`${response.status} ${response.statusText}\n\n${formatted.slice(0, 12000)}`);
      setTestStatus(response.ok ? "success" : "error");
    } catch (error) {
      setTestResult(error instanceof Error ? error.message : "Не удалось выполнить запрос");
      setTestStatus("error");
    }
  }

  return (
    <div className="page-shell soft-grid">
      <SEO title="API Documentation" description="Полная документация публичного API tetrixfilm.ru: каталог фильмов, фильтры, комнаты совместного просмотра, примеры запросов и тестовый консоль." path="/docs" />
      <Navigation />
      <main className="content-container pt-28 pb-16">
        <section className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(255,174,75,.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(47,125,182,.15),transparent_36%),linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.02))] px-6 py-10 sm:px-10 sm:py-14">
            <div className="relative max-w-4xl"><div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-extrabold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> API online</span><span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-muted-foreground">v1 · public</span></div><p className="section-eyebrow mt-8">TetrixFilm Developer Docs</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.07em] sm:text-6xl">API, который говорит о кино.</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">Получайте фильмы, сериалы, постеры, описания, рейтинги и ссылки на плеер через понятные HTTP-запросы. Эта документация объясняет API с нуля и содержит готовые примеры для curl, JavaScript и Python.</p><div className="mt-8 flex flex-wrap gap-3"><a href="#quickstart" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground transition hover:brightness-110">Быстрый старт <ArrowRight className="h-4 w-4" /></a><a href="#console" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-foreground transition hover:bg-white/[0.08]">Открыть тестер <Terminal className="h-4 w-4" /></a></div></div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><a href="#quickstart" className="surface-panel p-5 transition hover:-translate-y-0.5 hover:border-primary/30"><Gauge className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">Быстрый старт</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Первый запрос за минуту</p></a><a href="#catalog" className="surface-panel p-5 transition hover:-translate-y-0.5 hover:border-primary/30"><Database className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">Каталог</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Фильмы и сериалы</p></a><a href="#rooms" className="surface-panel p-5 transition hover:-translate-y-0.5 hover:border-primary/30"><Users className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">Watch Together</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Комнаты и realtime</p></a><a href="#errors" className="surface-panel p-5 transition hover:-translate-y-0.5 hover:border-primary/30"><ShieldCheck className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">Ошибки</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Коды и восстановление</p></a></div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block"><div className="sticky top-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">На этой странице</p><nav className="mt-3 space-y-1 text-sm">{[["quickstart", "Быстрый старт"], ["concepts", "Что такое API"], ["catalog", "Каталог"], ["filters", "Фильтры"], ["response", "Ответ и поля"], ["rooms", "Комнаты"], ["console", "Тестер запросов"], ["errors", "Ошибки"], ["testing", "Тестирование"]].map(([id, label]) => <a key={id} href={`#${id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"><ChevronRight className="h-3 w-3 text-primary" />{label}</a>)}</nav></div></aside>
            <div>
              <DocSection id="quickstart" eyebrow="01 · Quick start" title="Первый запрос за минуту"><p className="max-w-3xl text-sm leading-7 text-muted-foreground">API работает по обычному HTTPS. Для чтения каталога не нужен ключ: сформируйте URL, отправьте GET-запрос и получите JSON. Базовый адрес — <code className="rounded bg-white/[0.08] px-1.5 py-1 font-mono text-primary">{API_ORIGIN}</code>.</p><CodeBlock language="bash">{`curl "${catalogExample}"`}</CodeBlock><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["1", "Сформируйте URL", "Выберите endpoint и параметры."], ["2", "Отправьте GET", "Используйте браузер, curl или fetch."], ["3", "Разберите JSON", "Покажите данные в своём приложении."]].map(([num, title, text]) => <div key={num} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><span className="text-xs font-extrabold text-primary">ШАГ {num}</span><p className="mt-3 text-sm font-extrabold">{title}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></div>)}</div></DocSection>

              <DocSection id="concepts" eyebrow="02 · Основы" title="Что такое API"><p className="max-w-3xl text-sm leading-7 text-muted-foreground">API — это договор между программами. Клиент отправляет запрос по определённому адресу, сервер выполняет действие и возвращает стандартизированный ответ. В нашем случае клиентом является сайт EVLOEVFILM, а сервер API отдаёт актуальные данные каталога tetrixfilm.ru.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="surface-panel p-5"><Search className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">Запрос</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Метод, URL, query-параметры и при необходимости тело запроса.</p></div><div className="surface-panel p-5"><Server className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">Сервер</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Проверяет параметры, запрашивает VeoVeo и возвращает нормализованный ответ.</p></div><div className="surface-panel p-5"><Code2 className="h-5 w-5 text-primary" /><p className="mt-5 text-sm font-extrabold">JSON</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Структурированный формат, который удобно читать человеку и программе.</p></div></div></DocSection>

              <DocSection id="catalog" eyebrow="03 · Content API" title="Каталог фильмов и сериалов"><p className="text-sm leading-7 text-muted-foreground">Главный endpoint каталога возвращает данные из VeoVeo. Поддерживаются фильмы, сериалы и мультфильмы. Запросы к VeoVeo выполняются на сервере, поэтому служебные токены не попадают в браузер.</p><div className="mt-5 flex flex-wrap gap-2">{["GET /api/catalog", "films", "serials", "cartoon", "q search", "pagination"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-primary">{item}</span>)}</div><CodeBlock language="bash">{`# Популярные фильмы
curl "${API_ORIGIN}/api/catalog?type=films&pageSize=20"

# Сериалы 2025 года
curl "${API_ORIGIN}/api/catalog?type=serials&year=2025&pageSize=20"

# Поиск по названию или жанру
curl "${API_ORIGIN}/api/catalog?q=переводчик&pageSize=10"`}</CodeBlock><h3 className="mt-8 text-lg font-extrabold">Query-параметры</h3><div className="mt-4"><ApiTable headers={["Параметр", "Пример", "Описание"]} rows={catalogParams} /></div></DocSection>

              <DocSection id="filters" eyebrow="04 · Discovery" title="Фильтры каталога"><p className="text-sm leading-7 text-muted-foreground">Используйте фильтры, чтобы построить собственный каталог, форму поиска или выпадающие списки. Ответ кэшируется на сервере и содержит годы, языки, жанры, страны и типы контента.</p><CodeBlock language="bash">{`curl "${API_ORIGIN}/api/filters"`}</CodeBlock><CodeBlock language="json">{`{
  "years": [2026, 2025, 2024],
  "languages": [{ "id": 2, "name": "русский", "slug": "russkij" }],
  "genres": [{ "id": 8, "name": "Боевик", "slug": "boevik" }],
  "countries": [{ "id": 10, "name": "Великобритания", "slug": "velikobritania" }],
  "contentTypes": [{ "id": 4, "name": "Фильмы", "slug": "movie" }]
}`}</CodeBlock></DocSection>

              <DocSection id="response" eyebrow="05 · Data model" title="Ответ и поля фильма"><p className="text-sm leading-7 text-muted-foreground">Успешный ответ каталога содержит массив <code className="rounded bg-white/[0.08] px-1.5 py-1 font-mono text-primary">data</code>. Поля могут быть необязательными: например, у фильма обычно нет сезонов, а у некоторых старых записей может отсутствовать IMDb ID.</p><ApiTable headers={["Поле", "Тип", "Назначение"]} rows={responseFields} /><CodeBlock language="json">{`{
  "data": [{
    "id": 632,
    "title": "Переводчик",
    "originalTitle": "The Covenant",
    "description": "Описание сюжета…",
    "year": 2023,
    "posterUrl": "https://…/43056.jpg",
    "ratings": {
      "kinopoisk": { "rating": 7.9, "votes": 1114167 },
      "imdb": { "rating": 0, "votes": 0 }
    },
    "genres": [{ "id": 8, "name": "Боевик", "slug": "boevik" }],
    "playerUrl": "https://…/iframe?movie_id=632&token=…"
  }]
}`}</CodeBlock></DocSection>

              <DocSection id="examples" eyebrow="06 · SDK examples" title="Готовые примеры"><h3 className="text-lg font-extrabold">JavaScript / TypeScript</h3><CodeBlock language="javascript">{`const params = new URLSearchParams({
  type: "films",
  q: "переводчик",
  pageSize: "10"
});

const response = await fetch(
  "${API_ORIGIN}/api/catalog?" + params
);

if (!response.ok) {
  throw new Error("API error: " + response.status);
}

const { data } = await response.json();
const firstMovie = data[0];
console.log(firstMovie.title, firstMovie.posterUrl);`}</CodeBlock><h3 className="mt-8 text-lg font-extrabold">Python</h3><CodeBlock language="python">{`import requests

url = "${API_ORIGIN}/api/catalog"
params = {"type": "films", "q": "переводчик", "pageSize": 10}

response = requests.get(url, params=params, timeout=15)
response.raise_for_status()

movies = response.json().get("data", [])
for movie in movies:
    print(movie["title"], movie.get("year"))`}</CodeBlock><h3 className="mt-8 text-lg font-extrabold">React hook</h3><CodeBlock language="tsx">{`const { data, isLoading, error } = useQuery({
  queryKey: ["movies", type, query],
  queryFn: async () => {
    const url = new URL("${API_ORIGIN}/api/catalog");
    url.searchParams.set("type", type);
    url.searchParams.set("q", query);
    url.searchParams.set("pageSize", "20");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Catalog request failed");
    return response.json();
  }
});`}</CodeBlock></DocSection>

              <DocSection id="rooms" eyebrow="07 · Watch Together" title="Комнаты совместного просмотра"><p className="text-sm leading-7 text-muted-foreground">Room API используется разделом «Посмотреть вместе». Создатель комнаты управляет плеером, а участники получают изменения через SSE. Состояние комнаты хранит фильм, код, состояние воспроизведения и сообщения.</p><div className="mt-5"><ApiTable headers={["Метод", "Endpoint", "Назначение"]} rows={roomEndpoints} /></div><h3 className="mt-8 text-lg font-extrabold">Создать комнату</h3><CodeBlock language="bash">{`curl -X POST "${API_ORIGIN}/api/rooms" \\
  -H "Content-Type: application/json" \\
  -d '{
    "movie_id": 632,
    "movie_name": "Переводчик",
    "movie_iframe_url": "https://player.example/iframe",
    "movie_poster": "https://example.com/poster.jpg",
    "movie_type": "movie",
    "movie_year": 2023,
    "creator_id": "user-123"
  }'`}</CodeBlock><h3 className="mt-8 text-lg font-extrabold">Состояние плеера</h3><CodeBlock language="json">{`{
  "is_playing": true,
  "playback_time": 842.4,
  "updated_at": "2026-09-26T09:00:00.000Z"
}`}</CodeBlock><p className="mt-4 text-sm leading-7 text-muted-foreground">Для изменения состояния передавайте заголовок <code className="rounded bg-white/[0.08] px-1.5 py-1 font-mono text-primary">X-Room-Host-Token</code>. Токен ведущего возвращается только при создании комнаты и не должен публиковаться.</p></DocSection>

              <DocSection id="console" eyebrow="08 · Live console" title="Проверить API прямо здесь"><p className="text-sm leading-7 text-muted-foreground">Введите относительный endpoint и нажмите «Выполнить». Тестер обращается к публичному API без скрытых ключей и показывает HTTP-статус вместе с JSON-ответом.</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-black/20 px-4"><span className="mr-2 font-mono text-xs text-primary">GET</span><input value={testUrl} onChange={(event) => setTestUrl(event.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-xs text-foreground outline-none" aria-label="API endpoint" /></div><button type="button" onClick={runTest} disabled={testStatus === "loading"} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${testStatus === "loading" ? "animate-spin" : ""}`} />{testStatus === "loading" ? "Выполняем…" : "Выполнить"}</button></div>{testResult ? <pre className={`mt-5 max-h-[440px] overflow-auto rounded-2xl border p-5 text-xs leading-6 ${testStatus === "success" ? "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200" : "border-red-400/20 bg-red-400/[0.05] text-red-200"}`}><code>{testResult}</code></pre> : <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">Результат запроса появится здесь</div>}</DocSection>

              <DocSection id="errors" eyebrow="09 · Reliability" title="Ошибки и восстановление"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><p className="mt-4 text-sm font-extrabold">2xx — успех</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Запрос обработан. Для каталога ожидайте объект с массивом data.</p></div><div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5"><XCircle className="h-5 w-5 text-red-300" /><p className="mt-4 text-sm font-extrabold">4xx / 5xx — ошибка</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Проверьте параметры, код комнаты, права ведущего или повторите запрос позже.</p></div></div><div className="mt-5"><ApiTable headers={["Код", "Смысл", "Что делать"]} rows={[["200", "OK", "Используйте ответ."], ["201", "Created", "Комната или сообщение созданы."], ["400", "Bad Request", "Проверьте тело запроса и обязательные поля."], ["403", "Forbidden", "Нужен корректный host token ведущего."], ["404", "Not Found", "Проверьте endpoint или код комнаты."], ["502", "Upstream error", "Повторите запрос с задержкой; проблема во внешнем каталоге."]]}/></div><CodeBlock language="javascript">{`async function getCatalogWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      if (response.status < 500) throw new Error("HTTP " + response.status);
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}`}</CodeBlock></DocSection>

              <DocSection id="testing" eyebrow="10 · QA checklist" title="Как тестировать интеграцию"><div className="space-y-3">{[["Health check", "GET /health возвращает { ok: true }"], ["Catalog", "Фильмы, сериалы, поиск и pageSize возвращают data"], ["Metadata", "Проверить title, description, posterUrl, ratings и playerUrl"], ["Filters", "Годы, жанры, страны и типы контента загружаются"], ["Rooms", "Создание, получение, состояние и сообщения работают"], ["Security", "Участник без host token не меняет состояние"], ["Fallback", "Фронтенд корректно показывает ошибку при недоступности upstream"], ["CORS", "Публичный GET-запрос доступен из браузера"]].map(([title, text]) => <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div>)}</div><CodeBlock language="bash">{`# Быстрая проверка доступности
curl -i "${API_ORIGIN}/health"

# Проверка каталога
curl -s "${API_ORIGIN}/api/catalog?type=films&pageSize=1" | jq '.data[0] | {title, year, posterUrl, playerUrl}'

# Проверка фильтров
curl -s "${API_ORIGIN}/api/filters" | jq 'keys'`}</CodeBlock></DocSection>

              <section className="rounded-[2rem] border border-primary/20 bg-primary/[0.07] p-6 sm:p-8"><div className="flex items-start gap-4"><HelpCircle className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-xl font-extrabold">Нужна помощь с интеграцией?</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Начните с каталога и live-тестера. Для вопросов по комнатам совместного просмотра проверьте права ведущего и подключение SSE. Не публикуйте host token и не сохраняйте его в клиентском коде.</p><Link to="/support" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-primary hover:underline">Перейти в поддержку <ArrowRight className="h-4 w-4" /></Link></div></div></section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
