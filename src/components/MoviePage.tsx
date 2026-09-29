import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clapperboard,
  Clock,
  Database,
  ExternalLink,
  Film,
  Globe,
  Heart,
  Layers,
  Loader2,
  Mic,
  Play,
  Share2,
  Star,
} from "lucide-react";
import {
  fetchList,
  findEquivalent,
  findMovie,
  hydrateMovie,
  kindLabel,
  pool,
  ratingTone,
  shortQuality,
  similarTo,
  statusLabel,
  type Movie,
  type ProviderId,
  type SeasonInfo,
} from "../lib/api";
import { useAsync } from "../lib/hooks";
import { recallMovie, rememberMovie, useLibrary } from "../lib/library";
import { fmt } from "../lib/meta";
import { useProvider } from "../lib/provider-context";
import { getProvider, PROVIDERS } from "../lib/providers/registry";
import { navigate, type Route } from "../lib/router";
import { Loader3D } from "./Loader3D";
import { Poster } from "./MovieCard";
import { Row } from "./Row";
import { EmptyState } from "./ui";
import { cn } from "../utils/cn";

type MovieRoute = Extract<Route, { name: "movie" }>;

interface Props {
  route: MovieRoute;
  onOpen: (movie: Movie, play?: boolean) => void;
}

interface ActiveEpisode {
  season: number;
  n: number;
  url: string;
}

const DEFAULT_TITLE = "EVOLVEFILM — фильмы, сериалы и аниме онлайн";

/* ---------- small pieces ---------- */

function PlayerFrame({ src, title, poster }: { src: string; title: string; poster: string | null }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center overflow-hidden bg-ink-950">
          <Loader3D size="sm" label="Загружаем плеер" posters={[poster]} />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
      />
    </>
  );
}

function RatingTile({ label, value, votes }: { label: string; value: number | null; votes?: number | null }) {
  return (
    <div className="min-w-[104px] rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
      <div className={cn("flex items-center gap-1.5 font-display text-2xl font-bold", value ? ratingTone(value) : "text-zinc-500")}>
        <Star className="h-4 w-4 fill-current" />
        {value ? value.toFixed(1) : "—"}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</div>
      {votes ? <div className="mt-0.5 text-[10px] text-zinc-500">{fmt(votes)} голосов</div> : null}
    </div>
  );
}

function EpisodePicker({
  seasons,
  active,
  onPick,
}: {
  seasons: SeasonInfo[];
  active: ActiveEpisode | null;
  onPick: (season: number, n: number, url: string) => void;
}) {
  const [season, setSeason] = useState(active?.season ?? seasons[0].season);
  const current = seasons.find((s) => s.season === season) ?? seasons[0];

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Layers className="h-5 w-5 text-gold-400" /> Сезоны и серии
        </h3>
        <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto">
          {seasons.map((s) => (
            <button
              key={s.season}
              type="button"
              onClick={() => setSeason(s.season)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition",
                s.season === current.season
                  ? "bg-gold-400 text-ink-950 ring-gold-400"
                  : "bg-white/[0.04] text-zinc-300 ring-white/10 hover:bg-white/10 hover:text-white",
              )}
            >
              Сезон {s.season}
            </button>
          ))}
        </div>
      </div>

      {current.episodes.length > 0 ? (
        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2">
          {current.episodes.map((e) => {
            const on = active?.season === current.season && active.n === e.n;
            return (
              <button
                key={e.n}
                type="button"
                onClick={() => onPick(current.season, e.n, e.url)}
                aria-pressed={on}
                className={cn(
                  "rounded-xl py-2.5 text-sm font-bold ring-1 transition",
                  on
                    ? "bg-gold-400 text-ink-950 ring-gold-400 shadow-[0_8px_24px_-8px_rgba(255,164,31,0.8)]"
                    : "bg-white/[0.05] text-zinc-200 ring-white/10 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white",
                )}
              >
                {e.n}
              </button>
            );
          })}
        </div>
      ) : current.url ? (
        <button
          type="button"
          onClick={() => onPick(current.season, 0, current.url as string)}
          className="btn-gold mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
        >
          <Play className="h-4 w-4 fill-current" /> Смотреть сезон {current.season}
        </button>
      ) : null}
    </section>
  );
}

function AltSources({ movie, onOpen }: { movie: Movie; onOpen: (m: Movie, play?: boolean) => void }) {
  const [busy, setBusy] = useState<ProviderId | null>(null);
  const [missing, setMissing] = useState<ProviderId | null>(null);
  const others = PROVIDERS.filter((p) => p.id !== movie.provider);

  const go = async (id: ProviderId) => {
    setBusy(id);
    setMissing(null);
    try {
      const found = await findEquivalent(movie, id);
      if (found) {
        onOpen(found, true);
        return;
      }
    } catch {
      /* treated as "not found" below */
    } finally {
      setBusy(null);
    }
    setMissing(id);
    setTimeout(() => setMissing((m) => (m === id ? null : m)), 3500);
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white">Не грузится или нет нужной озвучки?</p>
      <p className="mt-1 text-xs text-zinc-400">Откройте этот же фильм через другой источник — мы найдём его автоматически.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {others.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy !== null}
            onClick={() => void go(p.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition disabled:opacity-60",
              missing === p.id
                ? "bg-rose-500/10 text-rose-300 ring-rose-400/30"
                : "bg-white/[0.06] text-white ring-white/10 hover:bg-white/12 hover:ring-gold-400/40",
            )}
          >
            {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 text-gold-300" />}
            {missing === p.id ? `Нет в ${p.short}` : `Смотреть в ${p.short}`}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export function MoviePage({ route, onOpen }: Props) {
  const { openDialog } = useProvider();
  const { isFavorite, toggleFavorite, pushHistory } = useLibrary();
  const key = `${route.provider}:${route.id}`;

  const [initial] = useState(() => pool.get(key) ?? recallMovie(key));
  const [movie, setMovie] = useState<Movie | null>(initial);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(initial ? "ready" : "loading");
  const [playing, setPlaying] = useState(Boolean(route.play));
  const [source, setSource] = useState<"movie" | "trailer">("movie");
  const [episode, setEpisode] = useState<ActiveEpisode | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // resolve the title: session pool → local cache → provider lookup
  useEffect(() => {
    let cancelled = false;
    setPlaying(Boolean(route.play));
    setSource("movie");
    setEpisode(null);
    setExpanded(false);

    const known = pool.get(key) ?? recallMovie(key);
    if (known) {
      setMovie(known);
      setStatus("ready");
      return undefined;
    }
    setMovie(null);
    setStatus("loading");
    findMovie(route.provider, route.id, route.title)
      .then((m) => {
        if (cancelled) return;
        if (m) {
          pool.set(m.key, m);
          setMovie(m);
          setStatus("ready");
        } else {
          setStatus("missing");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // extra data: episodes (Kodik) and description/voices from the main API
  useEffect(() => {
    if (!movie || movie.hydrated) return undefined;
    let cancelled = false;
    hydrateMovie(movie)
      .then((next) => {
        if (cancelled) return;
        setMovie(next);
        rememberMovie(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [movie]);

  useEffect(() => {
    if (!movie) return undefined;
    rememberMovie(movie);
    document.title = `${movie.title} — EVOLVEFILM`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.key]);

  useEffect(() => {
    if (playing && source === "movie" && movie) pushHistory(movie);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, source, movie?.key]);

  const similar = useAsync(
    async () => {
      if (!movie) return [] as Movie[];
      await fetchList(movie.provider, { type: movie.category, genre: movie.genres[0], size: 30 }).catch(() => undefined);
      return similarTo(movie, 16);
    },
    [movie?.key],
    Boolean(movie),
  );

  /* ----- loading / missing ----- */

  if (status === "loading") {
    return (
      <div className="grid min-h-[80vh] place-items-center px-5 pt-28">
        <Loader3D size="lg" label="Открываем фильм" hint={route.title ?? getProvider(route.provider).name} />
      </div>
    );
  }

  if (status === "missing" || !movie) {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-40">
        <EmptyState
          icon={Film}
          title="Фильм не найден"
          text="Возможно, ссылка устарела или этот источник больше не отдаёт фильм. Попробуйте другой источник или вернитесь на главную."
        >
          <button type="button" onClick={() => navigate({ name: "home" })} className="btn-gold rounded-full px-6 py-3 text-sm font-extrabold">
            На главную
          </button>
          <button type="button" onClick={openDialog} className="glass rounded-full px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15">
            Сменить источник
          </button>
        </EmptyState>
      </div>
    );
  }

  /* ----- ready ----- */

  const owner = getProvider(movie.provider);
  const fav = isFavorite(movie.key);
  const frameSrc = source === "trailer" ? movie.trailer : episode?.url || movie.player;
  const quality = shortQuality(movie.quality);
  const status_ = statusLabel(movie.status);
  const cover = movie.screenshot ?? movie.poster;
  const hasEpisodes = Boolean(movie.seasons?.some((s) => s.episodes.length > 0 || s.url));
  const maxCount = Math.max(1, ...movie.seasonCounts.map((s) => s.count));
  const waitingDescription = !movie.hydrated && !movie.description;

  const play = () => {
    setSource("movie");
    setPlaying(true);
    requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const back = () => {
    if (window.history.length > 1) window.history.back();
    else navigate({ name: "home" });
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard may be blocked — nothing to do */
    }
  };

  const facts: [string, string | null][] = [
    ["Год", movie.year ? String(movie.year) : null],
    ["Страна", movie.countries.length ? movie.countries.slice(0, 4).join(", ") : null],
    ["Тип", kindLabel(movie)],
    ["Качество", movie.quality],
    ["Возраст", movie.age],
    ["Длительность", movie.duration ? `${movie.duration} мин` : null],
    [
      "Сезоны",
      movie.seasonsCount && movie.isSeries
        ? `${movie.seasonsCount}${movie.episodesCount ? ` · ${movie.episodesCount} серий` : ""}`
        : null,
    ],
    ["Статус", status_],
    ["Источник", owner.name],
  ];

  return (
    <div className="relative isolate overflow-hidden">
      {movie.poster && (
        <img
          src={movie.poster}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-x-0 top-0 -z-20 h-[80vh] w-full scale-125 object-cover opacity-30 blur-3xl saturate-150"
        />
      )}
      <div className="absolute inset-x-0 top-0 -z-10 h-[80vh] bg-gradient-to-b from-ink-950/30 via-ink-950/80 to-ink-950" />

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 md:pt-32 lg:px-8">
        <button
          type="button"
          onClick={back}
          className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> Назад
        </button>

        {/* ---- player ---- */}
        <section ref={playerRef} className="mt-4 animate-fade-up">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/10 sm:rounded-3xl">
            {playing && frameSrc ? (
              <PlayerFrame key={frameSrc} src={frameSrc} title={`${source === "trailer" ? "Трейлер" : "Плеер"}: ${movie.title}`} poster={movie.poster} />
            ) : (
              <div className="absolute inset-0">
                {cover && (
                  <img
                    src={cover}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className={cn("absolute inset-0 h-full w-full object-cover", movie.screenshot ? "opacity-70" : "scale-110 opacity-50 blur-xl saturate-150")}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="relative z-10 flex h-full items-center gap-6 px-5 sm:gap-10 sm:px-10">
                  {movie.poster && (
                    <div className="hidden h-[78%] shrink-0 md:block">
                      <div className="relative aspect-[2/3] h-full overflow-hidden rounded-2xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20">
                        <Poster movie={movie} eager />
                      </div>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="hidden flex-wrap items-center gap-2 sm:flex">
                      <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-300 ring-1 ring-gold-400/30">
                        {kindLabel(movie)}
                      </span>
                      {quality && <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider text-white">{quality}</span>}
                    </div>
                    <h2 className="mt-1 line-clamp-2 font-display text-lg font-bold leading-tight text-white drop-shadow sm:mt-3 sm:text-3xl lg:text-4xl">
                      {movie.title}
                    </h2>
                    <button
                      type="button"
                      onClick={play}
                      disabled={!movie.player}
                      className="btn-gold group mt-3 inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-extrabold disabled:opacity-50 sm:mt-6 sm:px-8 sm:py-4 sm:text-base"
                    >
                      <span className="relative grid h-6 w-6 place-items-center sm:h-7 sm:w-7">
                        <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                      </span>
                      Смотреть онлайн
                    </button>
                    {!movie.player && <p className="mt-3 text-xs text-rose-300">В этом источнике нет плеера — попробуйте другой источник ниже.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={play}
              aria-pressed={playing && source === "movie"}
              disabled={!movie.player}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition disabled:opacity-50",
                playing && source === "movie" ? "bg-gold-400 text-ink-950 ring-gold-400" : "bg-white/[0.06] text-white ring-white/10 hover:bg-white/12",
              )}
            >
              <Play className="h-4 w-4 fill-current" />
              {movie.isSeries && episode ? `Сезон ${episode.season}${episode.n ? ` · серия ${episode.n}` : ""}` : "Фильм"}
            </button>
            {movie.trailer && (
              <button
                type="button"
                onClick={() => {
                  setSource("trailer");
                  setPlaying(true);
                }}
                aria-pressed={playing && source === "trailer"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition",
                  playing && source === "trailer" ? "bg-gold-400 text-ink-950 ring-gold-400" : "bg-white/[0.06] text-white ring-white/10 hover:bg-white/12",
                )}
              >
                <Clapperboard className="h-4 w-4" /> Трейлер
              </button>
            )}
            <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              {owner.name}
            </span>
            {frameSrc && playing && (
              <a
                href={frameSrc}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" /> В новой вкладке
              </a>
            )}
          </div>

          <AltSources movie={movie} onOpen={onOpen} />
        </section>

        {hasEpisodes && movie.seasons && (
          <EpisodePicker
            key={movie.key}
            seasons={movie.seasons}
            active={episode}
            onPick={(season, n, url) => {
              setEpisode({ season, n, url });
              setSource("movie");
              setPlaying(true);
              requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
            }}
          />
        )}

        {/* ---- info ---- */}
        <div className="mt-12 grid gap-9 lg:grid-cols-[280px_1fr] lg:gap-14">
          <aside>
            <div className="mx-auto w-44 sm:w-52 lg:sticky lg:top-28 lg:w-full">
              <div className="relative aspect-[2/3] overflow-hidden rounded-3xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
                <Poster movie={movie} eager />
              </div>
              <div className="mt-4 grid gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleFavorite(movie)}
                  aria-pressed={fav}
                  className={cn(
                    "glass inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold transition hover:bg-white/15",
                    fav ? "text-rose-300" : "text-white",
                  )}
                >
                  <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                  {fav ? "В избранном" : "В избранное"}
                </button>
                <button
                  type="button"
                  onClick={() => void share()}
                  className="glass inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Ссылка скопирована" : "Поделиться"}
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-300 ring-1 ring-gold-400/30">
                {kindLabel(movie)}
              </span>
              {quality && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-white">{quality}</span>}
              {movie.age && <span className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold text-zinc-200">{movie.age}</span>}
              {movie.year && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-zinc-200">{movie.year}</span>}
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">{movie.title}</h1>
            {movie.originalTitle && <p className="mt-2 text-base font-medium text-zinc-400 md:text-lg">{movie.originalTitle}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <RatingTile label="Кинопоиск" value={movie.kp} votes={movie.kpVotes} />
              <RatingTile label="IMDb" value={movie.imdb} />
              {movie.shiki !== null && <RatingTile label="Shikimori" value={movie.shiki} />}
            </div>

            {movie.genres.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span key={g} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h3 className="mb-3 font-display text-lg font-semibold text-white">Описание</h3>
              {movie.description ? (
                <>
                  <p className={cn("max-w-3xl text-[15px] leading-relaxed text-zinc-300", !expanded && "line-clamp-5")}>{movie.description}</p>
                  {movie.description.length > 320 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 text-sm font-semibold text-gold-300 transition hover:text-gold-200"
                    >
                      {expanded ? "Свернуть" : "Читать полностью"}
                    </button>
                  )}
                  {movie.descriptionFrom && movie.descriptionFrom !== movie.provider && (
                    <p className="mt-2 text-xs text-zinc-500">Описание получено из {getProvider(movie.descriptionFrom).name}</p>
                  )}
                </>
              ) : waitingDescription ? (
                <div className="max-w-3xl space-y-2.5" aria-label="Загружаем описание">
                  {[100, 96, 88, 60].map((w) => (
                    <div key={w} className="relative h-3.5 overflow-hidden rounded-md bg-ink-700" style={{ width: `${w}%` }}>
                      <div className="shimmer absolute inset-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-zinc-400">
                  Этот источник не отдаёт описание, а в главном каталоге такой фильм не нашёлся.{" "}
                  <button type="button" onClick={openDialog} className="font-semibold text-gold-300 transition hover:text-gold-200">
                    Выбрать другой источник
                  </button>
                </div>
              )}
            </div>

            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {facts
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-3 border-b border-white/5 pb-2.5">
                    <dt className="flex w-28 shrink-0 items-center gap-1.5 text-zinc-500">
                      {k === "Длительность" && <Clock className="h-3.5 w-3.5" />}
                      {k === "Страна" && <Globe className="h-3.5 w-3.5" />}
                      {k}
                    </dt>
                    <dd className="font-semibold text-zinc-100">{v}</dd>
                  </div>
                ))}
            </dl>

            {movie.voices.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                  <Mic className="h-3.5 w-3.5" /> Доступная озвучка
                </p>
                <div className="flex flex-wrap gap-2">
                  {movie.voices.slice(0, 18).map((v) => (
                    <span key={v} className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!hasEpisodes && movie.isSeries && movie.seasonCounts.length > 0 && (
              <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                  <Layers className="h-5 w-5 text-gold-400" /> Сезоны и серии
                </h3>
                <p className="mt-1 text-sm text-zinc-400">Выбор сезона, серии и озвучки — прямо в плеере.</p>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {movie.seasonCounts.map((s) => (
                    <div key={s.season} className="rounded-2xl bg-white/[0.05] px-4 py-3 ring-1 ring-white/10">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-bold text-white">Сезон {s.season}</span>
                        <span className="text-zinc-400">{s.count} серий</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-600" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {movie.collections.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">В подборках</p>
                <div className="flex flex-wrap gap-2">
                  {movie.collections.slice(0, 8).map((c) => (
                    <span key={c} className="rounded-lg bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-200 ring-1 ring-gold-400/15">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!(similar.data && similar.data.length === 0) && (
        <div className="pb-24">
          <Row title="Похожее" subtitle="Если понравилось это" icon={Film} items={similar.data} error={similar.error} onRetry={similar.retry} onOpen={onOpen} />
        </div>
      )}
    </div>
  );
}
