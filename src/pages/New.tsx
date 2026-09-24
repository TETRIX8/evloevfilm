import { useQuery } from "@tanstack/react-query";
import { Film, Sparkles } from "lucide-react";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/navigation/Navigation";
import { SEO } from "@/components/SEO";
import { fetchMovies } from "@/services/api";

export default function New() {
  const currentYear = new Date().getFullYear();
  const { data: newMovies, isLoading, isError } = useQuery({
    queryKey: ["new-movies", currentYear],
    queryFn: () => fetchMovies("films", String(currentYear), { limit: 50 }),
  });

  return (
    <div className="page-shell">
      <SEO title={`Новинки фильмов ${currentYear}`} description={`Смотреть новые фильмы ${currentYear} на EVLOEVFILM. Свежие премьеры и популярные новинки с удобным поиском.`} path="/new" />
      <Navigation />
      <main className="content-container pt-28">
        <header className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-[linear-gradient(120deg,rgba(255,174,75,.15),rgba(255,255,255,.03)_35%,rgba(47,125,182,.10))] px-6 py-10 sm:px-10 sm:py-12">
          <Sparkles className="absolute -right-4 -top-6 h-32 w-32 text-primary/10" aria-hidden="true" />
          <div className="relative max-w-2xl"><p className="section-eyebrow">Обновляется вместе с каталогом</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.07em] sm:text-4xl">Новинки {currentYear}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Свежие фильмы, которые уже можно добавить в список на вечер.</p></div>
        </header>
        <section className="mt-10"><div className="mb-6 flex items-center gap-3"><Film className="h-4 w-4 text-primary" /><p className="text-sm font-bold text-muted-foreground">{isLoading ? "Собираем подборку…" : isError ? "Не удалось загрузить подборку" : "Фильмы, которые смотрят прямо сейчас"}</p></div>{isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-2xl border border-white/[0.07] bg-secondary/60" />)}</div> : isError ? <div className="surface-panel p-8 text-center text-sm text-muted-foreground">Не удалось получить список новинок. Обновите страницу немного позже.</div> : <MovieGrid movies={newMovies || []} />}</section>
      </main>
    </div>
  );
}
