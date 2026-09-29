import { useMemo, useRef, type ReactNode } from "react";
import { Clapperboard, Database, Dices, Film, Flame, History, Popcorn, Sparkles, Trophy, Tv, type LucideIcon } from "lucide-react";
import type { ListResult, Movie } from "../lib/api";
import { useAsync, useInView } from "../lib/hooks";
import { useLibrary } from "../lib/library";
import { fmt, MOODS } from "../lib/meta";
import { useProvider } from "../lib/provider-context";
import { loadFresh, loadShelf, loadTotals, loadTrending, YEAR } from "../lib/queries";
import type { Route } from "../lib/router";
import { Hero } from "./Hero";
import { Loader3D } from "./Loader3D";
import { Row } from "./Row";
import { ErrorState, SectionHeading } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  onOpen: (movie: Movie, play?: boolean) => void;
  onNavigate: (r: Route) => void;
  onSurprise: () => void;
}

/** A row that only starts loading once it is close to the viewport. */
function DataRow({
  title,
  subtitle,
  icon,
  load,
  onOpen,
  onMore,
  ranked,
  take,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  load: () => Promise<ListResult>;
  onOpen: (m: Movie) => void;
  onMore?: () => void;
  ranked?: boolean;
  take?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, "500px");
  const { data, error, retry } = useAsync(load, [], near);
  const items = useMemo(() => {
    if (!data) return null;
    const withPoster = data.items.filter((m) => m.poster);
    return take ? withPoster.slice(0, take) : withPoster;
  }, [data, take]);

  return (
    <div ref={ref} className="min-h-[300px]">
      <Row title={title} subtitle={subtitle} icon={icon} items={items} error={error} onRetry={retry} onOpen={onOpen} onMore={onMore} ranked={ranked} />
    </div>
  );
}

function Stat({ icon: Icon, value, label, accent }: { icon: LucideIcon; value: number | undefined; label: string; accent: string }) {
  return (
    <div className="glass group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:bg-white/10 md:px-5">
      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-white/10", accent)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        {value === undefined ? (
          <div className="h-6 w-20 rounded-md bg-white/10" />
        ) : (
          <div className="truncate font-display text-lg font-bold text-white md:text-xl">{value ? fmt(value) : "—"}</div>
        )}
        <div className="text-xs font-semibold text-zinc-400">{label}</div>
      </div>
    </div>
  );
}

export function HomePage({ onOpen, onNavigate, onSurprise }: Props) {
  const { history } = useLibrary();
  const { provider, openDialog } = useProvider();
  const pid = provider.id;
  const trending = useAsync(() => loadTrending(pid), [pid]);
  const totals = useAsync(() => loadTotals(pid), [pid]);

  const heroMovies = useMemo(() => {
    const withPoster = (trending.data?.items ?? []).filter((m) => m.poster);
    const rated = withPoster.filter((m) => m.kp !== null || m.imdb !== null);
    const rest = withPoster.filter((m) => m.kp === null && m.imdb === null);
    return [...rated, ...rest].slice(0, 6);
  }, [trending.data]);

  const trendingRow = useMemo(() => {
    const used = new Set(heroMovies.map((m) => m.key));
    return (trending.data?.items ?? []).filter((m) => m.poster && !used.has(m.key)).slice(0, 24);
  }, [trending.data, heroMovies]);

  const [tFilms, tSerials, tCartoon, tAnime] = totals.data ?? [];
  const totalsReady = !totals.loading;

  let hero: ReactNode;
  if (trending.error) {
    hero = (
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-44">
        <ErrorState onRetry={trending.retry} />
      </div>
    );
  } else if (!trending.data) {
    hero = (
      <div className="grid min-h-[88vh] place-items-center pt-28">
        <Loader3D size="lg" label="Подбираем лучшее" hint={`Источник · ${provider.name}`} />
      </div>
    );
  } else {
    hero = <Hero movies={heroMovies} onOpen={onOpen} onPlay={(m) => onOpen(m, true)} />;
  }

  return (
    <div>
      {hero}

      <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-5 md:-mt-10 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Stat icon={Film} value={totalsReady ? (tFilms ?? 0) : undefined} label="фильмов" accent="bg-gold-400/15 text-gold-300" />
          <Stat icon={Tv} value={totalsReady ? (tSerials ?? 0) : undefined} label="сериалов" accent="bg-sky-400/15 text-sky-300" />
          <Stat icon={Clapperboard} value={totalsReady ? (tCartoon ?? 0) : undefined} label="мультфильмов" accent="bg-emerald-400/15 text-emerald-300" />
          <Stat icon={Sparkles} value={totalsReady ? (tAnime ?? 0) : undefined} label="аниме" accent="bg-fuchsia-400/15 text-fuchsia-300" />
        </div>

        <div className="mt-5 flex justify-center md:justify-start">
          <button
            type="button"
            onClick={openDialog}
            className="glass group inline-flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/15"
          >
            <span className={cn("grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br text-ink-950", provider.accent)}>
              <Database className="h-3.5 w-3.5" />
            </span>
            Источник: <span className="text-white">{provider.name}</span>
            <span className="text-gold-300 transition group-hover:translate-x-0.5">· сменить</span>
          </button>
        </div>
      </div>

      <div className="space-y-14 pb-24 pt-14 md:space-y-20 md:pt-20">
        {history.length > 0 && (
          <Row title="Продолжить просмотр" subtitle="Вы остановились здесь" icon={History} items={history.slice(0, 12)} onOpen={onOpen} onMore={() => onNavigate({ name: "library" })} />
        )}

        <Row
          title="Смотрят прямо сейчас"
          subtitle="Самые обсуждаемые фильмы"
          icon={Flame}
          items={trending.data ? trendingRow : null}
          error={trending.error}
          onRetry={trending.retry}
          onOpen={onOpen}
          onMore={() => onNavigate({ name: "catalog", category: "films" })}
        />

        <DataRow
          title="Топ-10 сериалов"
          subtitle="Что смотрят чаще всего"
          icon={Trophy}
          ranked
          take={10}
          load={() => loadShelf(pid, "serials", 30)}
          onOpen={onOpen}
          onMore={() => onNavigate({ name: "catalog", category: "serials" })}
        />

        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading icon={Popcorn} title="Выбор по настроению" subtitle="Скажите, чего хочется, — остальное найдём мы" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {MOODS.map((m) => (
              <button
                key={m.genre}
                type="button"
                onClick={() => onNavigate({ name: "catalog", category: "films", genre: m.genre })}
                className={cn(
                  "group relative isolate flex h-36 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-left ring-1 ring-white/15 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] md:h-44",
                  m.gradient,
                )}
              >
                <m.icon
                  className="absolute -right-3 -top-3 -z-10 h-28 w-28 rotate-12 text-white/25 transition duration-700 group-hover:rotate-0 group-hover:scale-110 md:h-32 md:w-32"
                  strokeWidth={1.4}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="font-display text-base font-bold leading-tight text-white drop-shadow md:text-lg">{m.title}</span>
                <span className="mt-1 text-xs font-semibold text-white/80">{m.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <DataRow
          title={`Новинки ${YEAR}`}
          subtitle="Свежие релизы, которые уже можно смотреть"
          icon={Sparkles}
          load={() => loadFresh(pid)}
          onOpen={onOpen}
          onMore={() => onNavigate({ name: "catalog", category: "films" })}
        />

        <DataRow
          title="Мультфильмы"
          subtitle="Для детей и взрослых, которые остались детьми"
          icon={Clapperboard}
          take={24}
          load={() => loadShelf(pid, "cartoon", 30)}
          onOpen={onOpen}
          onMore={() => onNavigate({ name: "catalog", category: "cartoon" })}
        />

        <DataRow
          title="Аниме"
          subtitle="Сюжеты, к которым хочется возвращаться"
          icon={Sparkles}
          take={24}
          load={() => loadShelf(pid, "anime-serials", 30)}
          onOpen={onOpen}
          onMore={() => onNavigate({ name: "catalog", category: "anime-serials" })}
        />

        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grain relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-gold-500/25 via-ink-800 to-ink-900 p-8 md:p-14">
            <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-gold-500/25 blur-[100px]" />
            <div className="absolute -bottom-24 left-10 -z-10 h-64 w-64 rounded-full bg-violet-500/15 blur-[100px]" />
            <Dices className="absolute -bottom-10 right-6 -z-10 h-56 w-56 -rotate-12 text-white/[0.05]" strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Не можете выбрать?</p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              Доверьтесь случаю — <span className="gold-text">мы подберём кино на вечер</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
              Нажмите на кнопку, и мы откроем случайный фильм с хорошим рейтингом. Не понравится — просто попробуйте ещё раз.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onSurprise} className="btn-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-extrabold">
                <Dices className="h-5 w-5" /> Удивите меня
              </button>
              <button
                type="button"
                onClick={() => onNavigate({ name: "catalog", category: "films" })}
                className="glass inline-flex items-center rounded-full px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/15"
              >
                Открыть каталог
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
