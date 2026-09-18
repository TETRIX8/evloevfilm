import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clapperboard, MonitorPlay, Play, Search, Sparkles, Star, Tv, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { Navigation } from "@/components/navigation/Navigation";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SearchResults } from "@/components/SearchResults";
import { useMovies, useMovieSearch } from "@/hooks/use-movies";
import { AIAssistant } from "@/components/ai-assistant/AIAssistant";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MovieCard } from "@/components/MovieCard";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";

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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const currentYear = new Date().getFullYear().toString();
  const { newMovies, newTVShows, newCartoons } = useMovies(currentYear);
  const { data: searchResults, error: searchError } = useMovieSearch(searchTerm);
  const popularMovies = useMemo(() => (newMovies.data || []).slice(0, 8), [newMovies.data]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsFirstLoad(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030a12] text-white">
      {isFirstLoad && <LoadingScreen />}
      <AppWebGLBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="relative isolate min-h-[680px] overflow-hidden border-b border-white/10 pt-16 md:min-h-[730px] md:pt-16">
          <div className="absolute inset-0 -z-20 bg-[#020912]" />
          <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-55 mix-blend-screen" style={{ backgroundImage: `url(${referenceImage})` }} />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_40%,rgba(18,128,255,.24),transparent_30%),linear-gradient(90deg,#030a12_0%,#061422cc_36%,#03101acc_75%,#020711_100%)]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#030a12]/50 via-transparent to-[#030a12]" />

          <div className="container relative flex min-h-[610px] flex-col justify-center px-5 pb-24 pt-16 md:px-8 lg:pb-28">
            <div className="max-w-2xl animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.38em] text-sky-300/90 md:text-sm">
                <span className="h-px w-10 bg-sky-400" /> Смотри · открывай · вдохновляй
              </div>
              <h1 className="max-w-2xl text-5xl font-black uppercase leading-[.93] tracking-[-.045em] text-white drop-shadow-2xl sm:text-6xl md:text-8xl">
                Лучшие фильмы<br />и сериалы<br /><span className="text-sky-400">на EVLOEVFILM</span>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-slate-300 md:text-xl md:leading-8">
                Тысячи фильмов, сериалов и мультфильмов в отличном качестве. Открывай новое кино каждый день.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" })} className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-sky-500 px-8 text-base font-bold shadow-[0_0_34px_rgba(14,165,233,.3)] transition hover:bg-sky-400 hover:shadow-[0_0_45px_rgba(14,165,233,.52)]">
                  <Play className="h-5 w-5 fill-current" /> Смотреть сейчас <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <button onClick={() => navigate("/new")} className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-7 font-semibold backdrop-blur-md transition hover:border-sky-400/70 hover:bg-white/10">
                  <Sparkles className="h-5 w-5 text-sky-300" /> Новинки
                </button>
              </div>
            </div>

            <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-2 lg:bottom-7 lg:grid-cols-4 lg:gap-5 lg:px-0">
              {[
                [Clapperboard, "Большая библиотека", "Фильмы, сериалы и аниме"],
                [MonitorPlay, "Высокое качество", "HD, Full HD и 4K"],
                [Tv, "На любых устройствах", "Телефон, планшет, Smart TV"],
                [Check, "Бесплатно", "Смотри без регистрации"],
              ].map(([Icon, title, text]) => {
                const FeatureIcon = Icon as typeof Clapperboard;
                return <div key={title as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071726]/85 px-4 py-3 backdrop-blur-xl md:px-5 md:py-4"><FeatureIcon className="h-8 w-8 shrink-0 text-sky-400" /><div><p className="text-sm font-bold text-white md:text-base">{title as string}</p><p className="mt-0.5 text-xs text-slate-400">{text as string}</p></div></div>;
              })}
            </div>
          </div>
        </section>

        <section className="container space-y-10 px-5 py-12 md:px-8 md:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2 text-sky-400"><Search className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[.28em]">Найди своё кино</span></div>
            <h2 className="text-3xl font-black md:text-5xl">Что будем смотреть сегодня?</h2>
            <p className="mt-3 text-sm text-slate-400 md:text-base">Ищи по названию, жанру или настроению</p>
            <SearchBar onSearch={setSearchTerm} placeholder="Поиск фильмов, сериалов..." className="mt-6 max-w-2xl" />
          </div>

          {searchTerm ? <SearchResults searchTerm={searchTerm} results={searchResults} /> : <>
            <div id="popular" className="space-y-5">
              <div className="flex items-end justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-sky-400">Выбор зрителей</p><h2 className="text-3xl font-black md:text-4xl">Популярное сейчас</h2></div><button onClick={() => navigate("/new")} className="hidden items-center gap-2 text-sm font-semibold text-sky-400 transition hover:text-sky-300 sm:flex">Смотреть всё <ArrowRight className="h-4 w-4" /></button></div>
              {popularMovies.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{popularMovies.slice(0, 5).map((movie, index) => <div key={`${movie.title}-${index}`} className="min-w-0"><MovieCard {...movie} /></div>)}</div> : <div className="h-60 rounded-3xl border border-white/10 bg-white/5" />}
            </div>
            <MovieCarousel title={`Новые фильмы ${currentYear}`} movies={newMovies.data} />
            <MovieCarousel title={`Новые сериалы ${currentYear}`} movies={newTVShows.data} />
            <MovieCarousel title="Свежие мультфильмы" movies={newCartoons.data} />

            <section className="space-y-5"><div className="flex items-end justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-sky-400">Выбирай настроение</p><h2 className="text-3xl font-black md:text-4xl">Жанры</h2></div><span className="hidden text-sm text-slate-500 sm:block">Для любого вечера</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{genres.map((genre) => <button key={genre.title} onClick={() => setSearchTerm(genre.title)} className="group relative h-28 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-left transition hover:-translate-y-1 hover:border-sky-400/70"><div className="absolute inset-0 bg-cover opacity-50 grayscale transition group-hover:scale-110 group-hover:grayscale-0" style={{ backgroundImage: `url(${referenceImage})`, backgroundPosition: genre.position }} /><div className="absolute inset-0 bg-gradient-to-t from-[#02060b] via-[#02060b66] to-transparent" /><div className="absolute bottom-3 left-4"><span className="mr-2 text-sky-300">{genre.icon}</span><span className="font-bold">{genre.title}</span></div></button>)}</div></section>
          </>}
        </section>
      </main>
      <AIAssistant />
    </div>
  );
}
