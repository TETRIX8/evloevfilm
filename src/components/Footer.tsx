import { Database, Mail, Terminal } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "../lib/meta";
import { useProvider } from "../lib/provider-context";
import type { Route } from "../lib/router";

export function Footer({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const { provider, openDialog } = useProvider();
  const link = "text-sm font-medium text-zinc-400 transition hover:text-gold-300";
  return (
    <footer className="relative mt-8 border-t border-white/5 bg-ink-900/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
            Киноплатформа нового поколения. Где каждый кадр — история, а каждый просмотр — событие.
          </p>
          <a href="mailto:tetrixuno@gmail.com" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-gold-300">
            <Mail className="h-4 w-4" /> tetrixuno@gmail.com
          </a>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Каталог</h4>
          <ul className="space-y-3">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button type="button" className={link} onClick={() => onNavigate({ name: "catalog", category: c.id })}>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Ваше</h4>
          <ul className="space-y-3">
            <li>
              <button type="button" className={link} onClick={() => onNavigate({ name: "library" })}>
                Избранное и история
              </button>
            </li>
            <li>
              <button type="button" className={`${link} inline-flex items-center gap-2`} onClick={() => onNavigate({ name: "api" })}>
                <Terminal className="h-4 w-4 text-gold-400" /> API, статус и тесты
              </button>
            </li>
            <li>
              <button type="button" className={`${link} inline-flex items-center gap-2`} onClick={openDialog}>
                <Database className="h-4 w-4 text-gold-400" /> Источник: {provider.short}
              </button>
            </li>
            <li className="text-sm text-zinc-500">
              Нажмите <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">/</kbd> для быстрого поиска
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-zinc-500 sm:flex-row lg:px-8">
          <span>© {new Date().getFullYear()} EVOLVEFILM. Все права защищены.</span>
          <span className="italic">«Мы не просто показываем фильмы — мы создаём атмосферу.»</span>
        </div>
      </div>
    </footer>
  );
}
