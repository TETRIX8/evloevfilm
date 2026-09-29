import { useState } from "react";
import { Bookmark, Heart, History, Trash2 } from "lucide-react";
import type { Movie } from "../lib/api";
import { useLibrary } from "../lib/library";
import type { Route } from "../lib/meta";
import { MovieGrid } from "./MovieCard";
import { EmptyState } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  onOpen: (m: Movie) => void;
  onNavigate: (r: Route) => void;
}

export function LibraryView({ onOpen, onNavigate }: Props) {
  const { favorites, history, clearHistory } = useLibrary();
  const [tab, setTab] = useState<"favorites" | "history">("favorites");
  const list = tab === "favorites" ? favorites : history;

  const tabs = [
    { id: "favorites" as const, label: "Избранное", icon: Heart, count: favorites.length },
    { id: "history" as const, label: "История просмотров", icon: History, count: history.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:pt-32 lg:px-8">
      <header className="grain relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-ink-600/80 via-ink-800 to-ink-900 p-7 md:p-11">
        <div className="absolute -left-16 -top-20 -z-10 h-64 w-64 rounded-full bg-rose-500/20 blur-[90px]" />
        <div className="absolute -right-10 bottom-0 -z-10 h-56 w-56 rounded-full bg-gold-500/20 blur-[90px]" />
        <Bookmark className="absolute -bottom-8 right-6 -z-10 h-48 w-48 text-white/[0.04]" strokeWidth={1} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Личное</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">Моя коллекция</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
          Всё, что вы сохранили и смотрели, хранится на этом устройстве — вход не нужен.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === t.id ? "bg-gold-400 text-ink-950 shadow-lg" : "text-zinc-300 hover:text-white",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px] font-extrabold leading-5", tab === t.id ? "bg-ink-950/20" : "bg-white/10")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === "history" && history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" /> Очистить историю
          </button>
        )}
      </div>

      <div className="mt-9">
        {list.length === 0 ? (
          <EmptyState
            icon={tab === "favorites" ? Heart : History}
            title={tab === "favorites" ? "Пока пусто" : "История пуста"}
            text={
              tab === "favorites"
                ? "Нажмите на сердечко на любой карточке — и фильм появится здесь."
                : "Начните смотреть — и мы запомним, на чём вы остановились."
            }
          >
            <button
              type="button"
              onClick={() => onNavigate({ name: "catalog", category: "films" })}
              className="btn-gold rounded-full px-6 py-3 text-sm font-extrabold"
            >
              Перейти в каталог
            </button>
          </EmptyState>
        ) : (
          <MovieGrid items={list} onOpen={onOpen} />
        )}
      </div>
    </div>
  );
}
