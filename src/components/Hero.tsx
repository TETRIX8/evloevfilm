import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Heart, Info, Play, Star } from "lucide-react";
import { kindLabel, shortQuality, type Movie } from "../lib/api";
import { useLibrary } from "../lib/library";
import { Poster } from "./MovieCard";
import { cn } from "../utils/cn";

interface Props {
  movies: Movie[];
  onOpen: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
}

const SLIDE_MS = 8000;

export function Hero({ movies, onOpen, onPlay }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const { isFavorite, toggleFavorite } = useLibrary();
  const count = movies.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  const movie = movies[index];
  if (!movie) return null;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);
  const kp = movie.kp;
  const imdb = movie.imdb;
  const quality = shortQuality(movie.quality);
  const fav = isFavorite(movie.key);

  return (
    <section
      className="grain relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setCycle((c) => c + 1);
      }}
      aria-roledescription="carousel"
      aria-label="Рекомендуем сегодня"
    >
      <div className="absolute inset-0 -z-10 bg-ink-950">
        {movies.map((m, i) => (
          <img
            key={m.key}
            src={m.poster ?? ""}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-top transition-[opacity,visibility] duration-1000 md:scale-125 md:blur-2xl md:saturate-150",
              i === index ? "visible opacity-60 md:opacity-40" : "invisible opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/40 to-transparent" />
        <div className="absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-gold-500/15 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/80 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[92svh] max-w-7xl items-end px-5 pb-28 pt-44 md:min-h-[88vh] md:items-center md:pb-32 md:pt-32 lg:px-8">
        <div className="grid w-full items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div key={movie.key} className="max-w-2xl animate-fade-up">
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold-300 ring-1 ring-gold-400/30">
                <Flame className="h-3.5 w-3.5" />
                Сейчас смотрят · №{index + 1}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-md">
                {kindLabel(movie)}
              </span>
            </div>

            <h1 className="font-display text-[clamp(2rem,5.4vw,4.4rem)] font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.5)]">
              {movie.title}
            </h1>
            {movie.originalTitle && (
              <p className="mt-3 text-base font-medium text-zinc-300/90 md:text-lg">{movie.originalTitle}</p>
            )}
            {movie.description && (
              <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-relaxed text-zinc-300/90 md:text-base">
                {movie.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-semibold text-zinc-200">
              {kp !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/15 px-2.5 py-1 text-emerald-300 ring-1 ring-emerald-300/25">
                  <Star className="h-3.5 w-3.5 fill-current" /> {kp.toFixed(1)} <span className="text-[10px] opacity-70">КП</span>
                </span>
              )}
              {imdb !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold-400/15 px-2.5 py-1 text-gold-300 ring-1 ring-gold-300/25">
                  <Star className="h-3.5 w-3.5 fill-current" /> {imdb.toFixed(1)} <span className="text-[10px] opacity-70">IMDb</span>
                </span>
              )}
              {movie.year && <span>{movie.year}</span>}
              {movie.age && <span className="rounded border border-white/30 px-1.5 py-0.5 text-xs">{movie.age}</span>}
              {quality && <span className="rounded bg-white/15 px-1.5 py-0.5 text-xs font-bold tracking-wider">{quality}</span>}
              {movie.countries[0] && <span className="text-zinc-300">{movie.countries.slice(0, 2).join(", ")}</span>}
            </div>

            {movie.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.slice(0, 4).map((g) => (
                  <span key={g} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-md">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlay(movie)}
                className="btn-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-extrabold"
              >
                <Play className="h-5 w-5 fill-current" /> Смотреть
              </button>
              <button
                type="button"
                onClick={() => onOpen(movie)}
                className="glass inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/15"
              >
                <Info className="h-5 w-5" /> Подробнее
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(movie)}
                aria-pressed={fav}
                aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
                className={cn(
                  "glass grid h-[52px] w-[52px] place-items-center rounded-full transition hover:bg-white/15",
                  fav ? "text-rose-400" : "text-white",
                )}
              >
                <Heart className={cn("h-5 w-5", fav && "fill-current")} />
              </button>
            </div>
          </div>

          <div className="relative hidden justify-self-end md:block">
            <div className="absolute -inset-6 rounded-[40px] bg-gold-500/25 blur-3xl" aria-hidden="true" />
            <button
              key={movie.key}
              type="button"
              onClick={() => onOpen(movie)}
              aria-label={`Открыть: ${movie.title}`}
              className="animate-float relative block aspect-[2/3] w-[270px] overflow-hidden rounded-[28px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20 lg:w-[330px]"
            >
              <Poster movie={movie} eager />
              <span className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
            </button>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-12 mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:bottom-16 lg:px-8">
          <div className="flex flex-1 items-center gap-2 md:max-w-md" role="tablist" aria-label="Слайды">
            {movies.map((m, i) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Слайд ${i + 1}: ${m.title}`}
                onClick={() => setIndex(i)}
                className="group relative h-6 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition group-hover:bg-white/35">
                  {i === index && (
                    <span
                      key={`${index}-${cycle}`}
                      className="animate-progress absolute inset-0 origin-left rounded-full bg-gold-400"
                      style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}
                  {i < index && <span className="absolute inset-0 rounded-full bg-gold-400/70" />}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="font-display text-sm font-semibold tabular-nums text-zinc-300">
              {String(index + 1).padStart(2, "0")} <span className="text-zinc-600">/ {String(count).padStart(2, "0")}</span>
            </span>
            <button type="button" aria-label="Предыдущий слайд" onClick={() => go(-1)} className="glass grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-gold-400 hover:text-ink-950">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Следующий слайд" onClick={() => go(1)} className="glass grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-gold-400 hover:text-ink-950">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
