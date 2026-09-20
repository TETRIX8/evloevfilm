import { useMemo, useState } from "react";
import { ArrowRight, Clapperboard, Compass, Play, Search, Sparkles, Tv } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { Navigation } from "@/components/navigation/Navigation";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SearchResults } from "@/components/SearchResults";
import { useMovies, useMovieSearch } from "@/hooks/use-movies";
import { AIAssistant } from "@/components/ai-assistant/AIAssistant";
import { MovieCard } from "@/components/MovieCard";

const referenceImage = "https://hf2medjbk42gnqik.public.blob.vercel-storage.com/public-photos/1789751594125-1000648248-Kg7qNfCuoMkKRQGTC2yfky2Kl0o6iA.png";

const genres = [
  { title: "Боевики", icon: "✦", position: "30% 20%" },
  { title: "Комедии", icon: "☺", position: "70% 30%" },
  { title: "Драмы", icon: "◒", position: "40% 60%" },
  { title: "Триллеры", icon: "◈", position: "78% 60%" },
  { title: "Ужасы", icon: "☾", position: "16% 70%" },
  { title: "Фантастика", icon: "✧", position: "60% 85%" },
  { title: "Мультфильмы", icon: "★", position: "90% 80%" },
  { title: "Сериалы", icon: "▣", position: "50% 10%" },
];

export default function Index() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear().toString();
  const { newMovies, newTVShows, newCartoons } = useMovies(currentYear);
  const { data: searchResults } = useMovieSearch(searchTerm);
  const popularMovies = useMemo(() => (newMovies.data || []).slice(0, 5), [newMovies.data]);

  return (
    <div className="page-shell">
      <Navigation />

      <main>
        <section className="relative isolate overflow-hidden border-b border-white/[0.07] pt-[72px]">
          <div className="absolute inset-0 -z-30 bg-[#0a0c11]" />
          <div className="absolute inset-0 -z-20 bg-cover bg-[72%_center] opacity-35 mix-blend-luminosity sm:bg-center" style={{ backgroundImage: `url(${referenceImage})` }} />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0a0c11_0%,#0a0c11_28%,rgba(10,12,17,.82)_54%,rgba(10,12,17,.16)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_38%,rgba(255,174,75,.16),transparent_27%),linear-gradient(0deg,#0a0c11_0%,transparent_40%)]" />

          <div className="container relative grid min-h-[650px] items-end gap-10 px-5 pb-10 pt-20 sm:px-8 md:min-h-[690px] md:pb-12 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
            <div className="max-w-2xl pb-5 md:pb-10">
              <div className="section-eyebrow mb-6 flex items-center gap-3"><span className="h-px w-8 bg-primary" /> Кино на сегодняшний вечер</div>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.085em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Выберите историю.<br /><span className="text-primary">Остальное</span> подскажет кино.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Фильмы, сериалы и аниме в одном спокойном пространстве — без лишнего шума, с понятным поиском и вашими сохранёнными находками.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-[0_12px_30px_rgba(255,174,75,.22)] transition hover:-translate-y-0.5 hover:bg-primary/90">
                  <Play className="h-4 w-4 fill-current" /> Смотреть подборку <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate("/new")} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.13] bg-white/[0.05] px-6 text-sm font-bold text-foreground backdrop-blur transition hover:border-white/30 hover:bg-white/[0.10]">
                  <Sparkles className="h-4 w-4 text-primary" /> Новинки года
                </button>
              </div>
            </div>

            <div className="relative hidden self-end lg:block">
              <div className="ml-auto max-w-sm rounded-[1.5rem] border border-white/[0.12] bg-[#151820]/80 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between"><span className="section-eyebrow">В одном месте</span><Clapperboard className="h-5 w-5 text-primary" /></div>
                <p className="mt-5 font-display text-xl font-semibold leading-snug tracking-[-0.06em]">Найдите фильм не по алгоритму, а по настроению.</p>
                <div className="mt-6 grid grid-cols-3 border-t border-white/[0.10] pt-4 text-center">
                  <div><p className="text-lg font-extrabold text-primary">01</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Фильмы</p></div>
                  <div className="border-x border-white/[0.10]"><p className="text-lg font-extrabold text-primary">02</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Сериалы</p></div>
                  <div><p className="text-lg font-extrabold text-primary">03</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Аниме</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-container space-y-12 md:space-y-16">
          <div className="surface-panel soft-grid mx-auto max-w-4xl px-5 py-8 sm:px-9 sm:py-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="section-eyebrow flex items-center justify-center gap-2"><Search className="h-3.5 w-3.5" /> Быстрый поиск</div>
              <h2 className="section-heading">Что хочется посмотреть?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Введите название, жанр или состояние души — начнём с этого.</p>
              <SearchBar onSearch={setSearchTerm} placeholder="Например, «детектив на вечер»" className="mx-auto mt-6 max-w-xl" />
            </div>
          </div>

          {searchTerm ? (
            <SearchResults searchTerm={searchTerm} results={searchResults} />
          ) : (
            <>
              <section id="popular" className="scroll-mt-28">
                <div className="mb-6 flex items-end justify-between gap-5">
                  <div><p className="section-eyebrow">Начните отсюда</p><h2 className="section-heading">Популярное сейчас</h2></div>
                  <button onClick={() => navigate("/new")} className="hidden items-center gap-2 text-sm font-bold text-primary transition hover:text-primary/75 sm:inline-flex">Все новинки <ArrowRight className="h-4 w-4" /></button>
                </div>
                {popularMovies.length > 0 ? <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">{popularMovies.map((movie, index) => <MovieCard key={`${movie.title}-${index}`} {...movie} />)}</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-2xl bg-secondary/60" />)}</div>}
              </section>

              <div className="space-y-12 md:space-y-16">
                <MovieCarousel title={`Новые фильмы ${currentYear}`} movies={newMovies.data} />
                <MovieCarousel title={`Новые сериалы ${currentYear}`} movies={newTVShows.data} />
                <MovieCarousel title="Свежие мультфильмы" movies={newCartoons.data} />
              </div>

              <section>
                <div className="mb-6 flex items-end justify-between gap-5"><div><p className="section-eyebrow">Выбор по настроению</p><h2 className="section-heading">Откройте жанр</h2></div><span className="hidden text-sm text-muted-foreground sm:block">Собрали варианты для любого вечера</span></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {genres.map((genre) => (
                    <button key={genre.title} onClick={() => setSearchTerm(genre.title)} className="group relative h-32 overflow-hidden rounded-2xl border border-white/[0.09] bg-secondary text-left shadow-[0_16px_30px_rgba(0,0,0,.16)] transition hover:-translate-y-1 hover:border-primary/50 sm:h-36">
                      <div className="absolute inset-0 bg-cover opacity-35 saturate-0 transition duration-500 group-hover:scale-110 group-hover:opacity-55 group-hover:saturate-100" style={{ backgroundImage: `url(${referenceImage})`, backgroundPosition: genre.position }} />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,13,.12),rgba(8,9,13,.90))]" />
                      <div className="absolute bottom-4 left-4"><span className="mr-2 text-primary">{genre.icon}</span><span className="text-sm font-extrabold">{genre.title}</span></div>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          <section className="surface-panel flex flex-col items-start justify-between gap-5 px-6 py-7 sm:flex-row sm:items-center sm:px-8">
            <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Compass className="h-5 w-5" /></span><div><p className="font-bold">Не знаете, с чего начать?</p><p className="mt-1 text-sm text-muted-foreground">Перейдите в чат и попросите подборку под настроение.</p></div></div>
            <button onClick={() => navigate("/chat")} className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-primary transition hover:text-primary/75">Открыть чат <ArrowRight className="h-4 w-4" /></button>
          </section>
        </section>
      </main>
      <AIAssistant />
    </div>
  );
}
