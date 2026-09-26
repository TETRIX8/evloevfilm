import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Code2, Database, Layers3, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/navigation/Navigation";
import { SEO } from "@/components/SEO";

interface CatalogPreview {
  title?: string;
  posterUrl?: string;
}

interface CatalogResponse {
  data?: CatalogPreview[];
}

const endpoint = "https://tetrixfilm.ru/api/catalog?type=films&pageSize=3";

export default function ApiInfo() {
  const [movies, setMovies] = useState<CatalogPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog?type=films&pageSize=3")
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json() as Promise<CatalogResponse>;
      })
      .then((payload) => {
        if (!cancelled) {
          setMovies(payload.data || []);
          setIsOnline(true);
        }
      })
      .catch(() => {
        if (!cancelled) setIsOnline(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-shell soft-grid">
      <SEO
        title="Что такое API"
        description="Простое объяснение, как API tetrixfilm.ru получает фильмы, описания, постеры и данные для плеера."
        path="/api-info"
      />
      <Navigation />
      <main className="content-container pt-28 pb-16">
        <section className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(255,174,75,.2),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.02))] px-6 py-10 sm:px-10 sm:py-14">
            <div className="relative max-w-3xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Code2 className="h-6 w-6" /></div>
              <p className="section-eyebrow mt-7">Технологии EVLOEVFILM</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.07em] sm:text-6xl">API без сложных слов.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">API — это способ, с помощью которого одна программа обращается к другой. Наш сайт запрашивает у каталога tetrixfilm.ru информацию о фильмах и показывает её вам в красивом интерфейсе.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground transition hover:brightness-110">Вернуться к фильмам <ArrowRight className="h-4 w-4" /></Link>
                <a href={endpoint} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-foreground transition hover:bg-white/[0.08]">Открыть ответ API <Code2 className="h-4 w-4" /></a>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="surface-panel p-6"><Database className="h-5 w-5 text-primary" /><h2 className="mt-6 text-base font-extrabold">Запрос</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Сайт отправляет адрес API и параметры: например, что нужны фильмы и только три результата.</p></article>
            <article className="surface-panel p-6"><Layers3 className="h-5 w-5 text-primary" /><h2 className="mt-6 text-base font-extrabold">Ответ</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">API возвращает структурированные данные: название, описание, постер, рейтинг, жанры и ссылку на плеер.</p></article>
            <article className="surface-panel p-6"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="mt-6 text-base font-extrabold">Интерфейс</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Приложение превращает эти данные в карточки, поиск, страницу фильма, историю и избранное.</p></article>
          </div>

          <section className="surface-panel mt-6 overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-eyebrow">Пример запроса</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">Как сайт получает фильмы</h2></div><span className={`inline-flex items-center gap-2 text-xs font-bold ${isOnline ? "text-emerald-400" : "text-muted-foreground"}`}><span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-muted-foreground"}`} />{isLoading ? "Проверяем API…" : isOnline ? "API отвечает" : "Нет ответа"}</span></div>
            <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/25 p-5 text-xs leading-6 text-primary/90"><code>{`GET /api/catalog?type=films&pageSize=3`}</code></pre>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">В ответ приходит JSON — обычный структурированный текст, который удобно читать программам. Например, один объект фильма содержит поля ниже:</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{["title — название", "description — описание", "posterUrl — постер", "year — год", "ratings — рейтинги", "playerUrl — плеер"].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-xs font-semibold text-muted-foreground"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />{item}</div>)}</div>
          </section>

          <section className="surface-panel mt-6 p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="section-eyebrow">Живой ответ</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">Что API отдаёт сейчас</h2></div><span className="text-xs font-bold text-muted-foreground">{movies.length} фильма в примере</span></div>{isLoading ? <div className="mt-6 grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/[0.05]" />)}</div> : movies.length ? <div className="mt-6 grid gap-3 sm:grid-cols-3">{movies.map((movie, index) => <div key={`${movie.title}-${index}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3"><img src={movie.posterUrl || "/placeholder.svg"} alt="" className="h-16 w-11 rounded-lg object-cover" /><p className="text-sm font-bold leading-5">{movie.title || "Фильм из каталога"}</p></div>)}</div> : <p className="mt-6 text-sm text-muted-foreground">API временно не вернул демонстрационные данные.</p>}</section>
        </section>
      </main>
    </div>
  );
}
