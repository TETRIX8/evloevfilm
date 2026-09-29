import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Database, Loader2, SearchX } from "lucide-react";
import { fetchPages, mergeUnique, type Category, type Movie, type SortKey } from "../lib/api";
import { CATEGORIES, GENRES } from "../lib/meta";
import { useProvider } from "../lib/provider-context";
import type { Route } from "../lib/router";
import { Loader3D } from "./Loader3D";
import { MovieGrid } from "./MovieCard";
import { CardSkeleton, EmptyState, ErrorState } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  category: Category;
  genre?: string;
  onOpen: (m: Movie) => void;
  onNavigate: (r: Route) => void;
}

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1949 }, (_, i) => THIS_YEAR - i);
const MIN_VISIBLE = 18;
const MAX_AUTO_LOADS = 6;

function Select({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: ReactNode }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-full bg-white/[0.07] py-2.5 pl-4 pr-10 text-sm font-semibold text-white ring-1 ring-white/10 outline-none transition hover:bg-white/10 focus:ring-gold-400/60"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </label>
  );
}

export function CatalogView({ category, genre, onOpen, onNavigate }: Props) {
  const { provider, openDialog } = useProvider();
  const meta = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<SortKey>(provider.sorts[0].id);
  const [activeGenre, setActiveGenre] = useState<string>(genre ?? "");

  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const tokenRef = useRef(0);
  const autoRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    setActiveGenre(genre ?? "");
  }, [genre, category]);

  // some APIs filter genres on the server, the others are filtered locally below
  const serverGenre = provider.serverGenre(category) ? activeGenre : "";

  const run = useCallback(
    async (reset: boolean) => {
      const token = reset ? ++tokenRef.current : tokenRef.current;
      if (reset) {
        pageRef.current = 0;
        setItems([]);
        setHasMore(true);
      }
      busyRef.current = true;
      setLoading(true);
      setError(false);
      const next = pageRef.current + 1;
      try {
        const res = await fetchPages(
          provider.id,
          { type: category, year: year || undefined, sort, genre: serverGenre || undefined, size: provider.features.pageSize },
          [next],
        );
        if (token !== tokenRef.current) return;
        pageRef.current = next;
        setItems((prev) => mergeUnique(reset ? [] : prev, res.items));
        setHasMore(res.hasMore ?? res.items.length > 0);
      } catch {
        if (token === tokenRef.current) setError(true);
      } finally {
        if (token === tokenRef.current) {
          busyRef.current = false;
          setLoading(false);
        }
      }
    },
    [provider, category, year, sort, serverGenre],
  );

  useEffect(() => {
    autoRef.current = 0;
    void run(true);
  }, [run]);

  useEffect(() => {
    autoRef.current = 0;
  }, [activeGenre]);

  const visible = useMemo(
    () => (activeGenre ? items.filter((m) => m.genres.includes(activeGenre)) : items),
    [items, activeGenre],
  );

  // local genre filtering: keep pulling pages until the grid feels full
  useEffect(() => {
    if (!activeGenre || loading || error || !hasMore || busyRef.current) return;
    if (visible.length >= MIN_VISIBLE || autoRef.current >= MAX_AUTO_LOADS) return;
    autoRef.current += 1;
    void run(false);
  }, [activeGenre, loading, error, hasMore, visible.length, run]);

  const initial = loading && items.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:pt-32 lg:px-8">
      <header className="grain relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-ink-600/80 via-ink-800 to-ink-900 p-7 md:p-11">
        <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-gold-500/20 blur-[90px]" />
        <div className="absolute -bottom-24 left-1/3 -z-10 h-60 w-60 rounded-full bg-violet-500/15 blur-[90px]" />
        <meta.icon className="absolute -bottom-6 right-6 -z-10 h-44 w-44 text-white/[0.04] md:h-60 md:w-60" strokeWidth={1} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Каталог</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
          {meta.title}
          {activeGenre && <span className="gold-text"> · {activeGenre}</span>}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">{meta.blurb}</p>
        <button
          type="button"
          onClick={openDialog}
          className="glass mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/15"
        >
          <Database className="h-4 w-4 text-gold-300" />
          Источник: <span className="text-white">{provider.name}</span>
          <span className="text-gold-300">· сменить</span>
        </button>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onNavigate({ name: "catalog", category: c.id })}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                c.id === category ? "bg-gold-400 text-ink-950 shadow-lg" : "text-zinc-300 hover:text-white",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select label="Год выпуска" value={year} onChange={setYear}>
              <option value="" className="bg-ink-800">Любой год</option>
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-ink-800">{y}</option>
              ))}
            </Select>
          </div>
          {provider.sorts.length > 1 && (
            <div className="w-52">
              <Select label="Сортировка" value={sort} onChange={(v) => setSort(v as SortKey)}>
                {provider.sorts.map((s) => (
                  <option key={s.id} value={s.id} className="bg-ink-800">{s.label}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        <button
          type="button"
          onClick={() => setActiveGenre("")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
            !activeGenre ? "bg-white text-ink-950 ring-white" : "bg-white/[0.04] text-zinc-300 ring-white/10 hover:bg-white/10 hover:text-white",
          )}
        >
          Все жанры
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGenre(g === activeGenre ? "" : g)}
            aria-pressed={g === activeGenre}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
              g === activeGenre
                ? "bg-gold-400 text-ink-950 ring-gold-400"
                : "bg-white/[0.04] text-zinc-300 ring-white/10 hover:bg-white/10 hover:text-white",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-9">
        {error && items.length === 0 ? (
          <ErrorState onRetry={() => void run(true)} />
        ) : initial ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <Loader3D size="md" label="Загружаем каталог" hint={provider.name} />
          </div>
        ) : visible.length === 0 && !loading ? (
          <EmptyState icon={SearchX} title="Ничего не нашлось" text="Попробуйте другой жанр, год или источник — в каталоге точно есть что посмотреть.">
            <button
              type="button"
              onClick={() => {
                setActiveGenre("");
                setYear("");
              }}
              className="btn-gold rounded-full px-6 py-3 text-sm font-extrabold"
            >
              Сбросить фильтры
            </button>
            <button type="button" onClick={openDialog} className="glass rounded-full px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15">
              Сменить источник
            </button>
          </EmptyState>
        ) : (
          <>
            <MovieGrid items={visible} onOpen={onOpen} />
            {loading && (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}
            {!loading && hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => void run(false)}
                  className="glass inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-bold text-white transition hover:bg-gold-400 hover:text-ink-950"
                >
                  {error ? "Повторить загрузку" : "Показать ещё"}
                </button>
              </div>
            )}
            {loading && items.length > 0 && (
              <div className="mt-8 flex justify-center text-gold-400" aria-live="polite">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
