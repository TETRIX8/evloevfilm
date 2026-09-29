import { useState } from "react";
import { Film, Heart, Play, Star } from "lucide-react";
import { bestRating, ratingTone, shortQuality, type Movie } from "../lib/api";
import { useLibrary } from "../lib/library";
import { cn } from "../utils/cn";

export function Poster({ movie, className, eager }: { movie: Movie; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!movie.poster || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink-600 via-ink-700 to-ink-800 p-4 text-center",
          className,
        )}
      >
        <Film className="h-8 w-8 text-gold-400/70" />
        <span className="line-clamp-4 text-xs font-semibold text-zinc-300">{movie.title}</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="shimmer absolute inset-0" />}
      <img
        src={movie.poster}
        alt={`Постер: ${movie.title}`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-cover transition duration-700",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}

interface CardProps {
  movie: Movie;
  onOpen: (movie: Movie) => void;
  className?: string;
}

export function MovieCard({ movie, onOpen, className }: CardProps) {
  const { isFavorite, toggleFavorite } = useLibrary();
  const fav = isFavorite(movie.key);
  const rating = bestRating(movie);
  const quality = shortQuality(movie.quality);
  const meta = [movie.year, movie.genres[0]].filter(Boolean).join(" · ");

  return (
    <article className={cn("group relative", className)}>
      <button
        type="button"
        onClick={() => onOpen(movie)}
        aria-label={`Открыть: ${movie.title}`}
        className="block w-full text-left"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-ink-700 ring-1 ring-white/10 transition duration-500 group-hover:-translate-y-1.5 group-hover:ring-gold-400/50 group-hover:shadow-[0_26px_60px_-18px_rgba(255,164,31,0.5)]">
          <div className="absolute inset-0 transition duration-700 group-hover:scale-[1.06]">
            <Poster movie={movie} />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/10 to-transparent opacity-70 transition duration-500 group-hover:opacity-100" />

          <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition duration-500 group-hover:opacity-100">
            <span className="grid h-14 w-14 scale-75 place-items-center rounded-full bg-gold-400 text-ink-950 shadow-[0_10px_30px_rgba(255,164,31,0.6)] transition duration-500 group-hover:scale-100">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </div>

          {rating !== null && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink-950/75 px-2 py-1 text-[11px] font-bold backdrop-blur-md ring-1 ring-white/10">
              <Star className={cn("h-3 w-3 fill-current", ratingTone(rating))} />
              <span className={ratingTone(rating)}>{rating.toFixed(1)}</span>
            </span>
          )}

          {quality && (
            <span className="absolute bottom-2 left-2 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {quality}
            </span>
          )}
        </div>

        <div className="mt-3 px-0.5">
          <h3 className="line-clamp-1 text-sm font-bold text-white transition group-hover:text-gold-300">
            {movie.title}
          </h3>
          {meta && <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{meta}</p>}
        </div>
      </button>

      <button
        type="button"
        onClick={() => toggleFavorite(movie)}
        aria-pressed={fav}
        aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
        className={cn(
          "absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink-950/70 backdrop-blur-md ring-1 ring-white/10 transition hover:scale-110 hover:bg-ink-950",
          fav
            ? "text-rose-400 opacity-100"
            : "text-white opacity-0 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
        )}
      >
        <Heart className={cn("h-4 w-4", fav && "fill-current")} />
      </button>
    </article>
  );
}

export function MovieGrid({ items, onOpen }: { items: Movie[]; onOpen: (m: Movie) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((m, i) => (
        <div key={m.key} className="animate-fade-up" style={{ animationDelay: `${Math.min(i % 12, 11) * 40}ms` }}>
          <MovieCard movie={m} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}
