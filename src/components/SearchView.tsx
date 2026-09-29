import { SearchX, Search as SearchIcon } from "lucide-react";
import { fetchPages, type Movie } from "../lib/api";
import { useAsync } from "../lib/hooks";
import { fmt } from "../lib/meta";
import { useProvider } from "../lib/provider-context";
import { MovieGrid } from "./MovieCard";
import { CardSkeleton, EmptyState, ErrorState } from "./ui";

interface Props {
  query: string;
  debounced: string;
  onOpen: (m: Movie) => void;
}

export function SearchView({ query, debounced, onOpen }: Props) {
  const { provider, openDialog } = useProvider();
  const term = debounced.trim();
  const enabled = term.length >= 2;
  const { data, loading, error, retry } = useAsync(
    () => fetchPages(provider.id, { name: term, size: 30 }, [1]),
    [term, provider.id],
    enabled,
  );
  const waiting = query.trim() !== term || (enabled && loading);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:pt-32 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Результаты поиска · {provider.short}</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-4xl">«{query.trim()}»</h1>
      {data && !waiting && data.total > 0 && <p className="mt-2 text-sm text-zinc-400">Найдено: {fmt(data.total)}</p>}

      <div className="mt-9">
        {term.length < 2 ? (
          <EmptyState icon={SearchIcon} title="Продолжайте вводить" text="Введите хотя бы два символа — например, название фильма или сериала." />
        ) : error ? (
          <ErrorState onRetry={retry} />
        ) : waiting || !data ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            text="Проверьте написание или попробуйте искать по оригинальному названию. Другой источник тоже может знать этот фильм."
          >
            <button type="button" onClick={openDialog} className="btn-gold rounded-full px-6 py-3 text-sm font-extrabold">
              Искать в другом источнике
            </button>
          </EmptyState>
        ) : (
          <MovieGrid items={data.items} onOpen={onOpen} />
        )}
      </div>
    </div>
  );
}
