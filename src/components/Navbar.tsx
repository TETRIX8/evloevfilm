import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, Database, Home, LogIn, Search, Terminal, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "../lib/meta";
import { useProvider } from "../lib/provider-context";
import type { Route } from "../lib/router";
import { cn } from "../utils/cn";
import { useAuth } from "../lib/auth-context";

interface Props {
  route: Route;
  searching: boolean;
  query: string;
  onQuery: (q: string) => void;
  onNavigate: (r: Route) => void;
  libraryCount: number;
}

export function Navbar({ route, searching, query, onQuery, onNavigate, libraryCount }: Props) {
  const { provider, openDialog } = useProvider();
  const { user, openLogin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = [
    { key: "home", label: "Главная", icon: Home, active: !searching && route.name === "home", go: () => onNavigate({ name: "home" }) },
    ...CATEGORIES.map((c) => ({
      key: c.id,
      label: c.label,
      icon: c.icon,
      active: !searching && route.name === "catalog" && route.category === c.id,
      go: () => onNavigate({ name: "catalog", category: c.id }),
    })),
    {
      key: "api",
      label: "API",
      icon: Terminal,
      active: !searching && route.name === "api",
      go: () => onNavigate({ name: "api" }),
    },
  ];

  const pill = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
      active ? "bg-white text-ink-950 shadow-lg" : "text-zinc-300 hover:bg-white/10 hover:text-white",
    );

  const libraryActive = !searching && route.name === "library";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-ink-950/80 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl" : "bg-gradient-to-b from-ink-950/90 to-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-3 sm:gap-3 md:py-4 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate({ name: "home" })}
          aria-label="EVOLVEFILM — на главную"
          className="shrink-0 rounded-xl transition hover:opacity-90"
        >
          <Logo compact />
        </button>

        <nav aria-label="Основная навигация" className="ml-4 hidden items-center gap-1 md:flex lg:ml-6">
          {items.map((it) => (
            <button key={it.key} type="button" onClick={it.go} className={pill(it.active)} aria-current={it.active ? "page" : undefined}>
              {it.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative flex items-center">
            <span className="sr-only">Поиск по каталогу</span>
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400" />
            <input
              ref={input}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (onQuery(""), input.current?.blur())}
              type="search"
              placeholder="Найти фильм или сериал"
              autoComplete="off"
              className="w-28 rounded-full bg-white/[0.07] py-2.5 pl-10 pr-9 text-sm text-white ring-1 ring-white/10 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:bg-white/10 focus:ring-gold-400/60 min-[420px]:w-36 sm:w-52 md:focus:w-72 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label="Очистить поиск"
                onClick={() => {
                  onQuery("");
                  input.current?.focus();
                }}
                className="absolute right-2 grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={openDialog}
            aria-label={`Источник данных: ${provider.name}. Сменить`}
            title={`Источник: ${provider.name}`}
            className="group inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15 hover:ring-gold-400/40"
          >
            <span className="relative grid h-4 w-4 place-items-center">
              <Database className="h-4 w-4 text-gold-300" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </span>
            <span className="hidden xl:inline">{provider.short}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-zinc-400 transition group-hover:text-white sm:block" />
          </button>

          <button
            type="button"
            onClick={() => (user ? void logout() : openLogin())}
            title={user ? "Выйти" : "Войти через Telegram"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold ring-1 transition",
              user ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/25 hover:bg-rose-400/10 hover:text-rose-200" : "bg-sky-400/10 text-sky-200 ring-sky-400/25 hover:bg-sky-400/20",
            )}
          >
            {user ? <UserRound className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span className="hidden xl:inline">{user ? user.name.split(" ")[0] : "Войти"}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate({ name: "library" })}
            aria-label="Моя коллекция"
            aria-current={libraryActive ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold ring-1 transition",
              libraryActive
                ? "bg-gold-400 text-ink-950 ring-gold-400"
                : "bg-white/[0.07] text-white ring-white/10 hover:bg-white/15",
            )}
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden xl:inline">Коллекция</span>
            {libraryCount > 0 && (
              <span
                className={cn(
                  "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-extrabold leading-5",
                  libraryActive ? "bg-ink-950 text-gold-300" : "bg-gold-400 text-ink-950",
                )}
              >
                {libraryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav aria-label="Разделы" className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3 md:hidden">
        {items.map((it) => (
          <button key={it.key} type="button" onClick={it.go} className={pill(it.active)} aria-current={it.active ? "page" : undefined}>
            <it.icon className="h-4 w-4" />
            {it.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
