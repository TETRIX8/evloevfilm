import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Database, Film, RefreshCw, Sparkles, X, type LucideIcon } from "lucide-react";
import { pingProvider } from "../lib/api";
import { PROVIDERS } from "../lib/providers/registry";
import type { Provider, ProviderId } from "../lib/types";
import { cn } from "../utils/cn";

interface Props {
  current: ProviderId;
  onSelect: (id: ProviderId) => void;
  onClose: () => void;
}

type Ping = { state: "checking" } | { state: "ok"; ms: number } | { state: "fail" };

const ICONS: Record<ProviderId, LucideIcon> = { tetrix: Database, evloev: Film, kodik: Sparkles };

function featureChips(p: Provider): string[] {
  const out: string[] = [];
  if (p.features.descriptions) out.push("Описания");
  if (p.features.voices) out.push("Озвучки");
  if (p.features.episodes) out.push("Выбор серий");
  if (p.features.serverGenre) out.push("Жанры на сервере");
  if (p.sorts.length > 2) out.push(`Сортировка · ${p.sorts.length}`);
  return out;
}

function PingBadge({ ping }: { ping: Ping | undefined }) {
  if (!ping || ping.state === "checking") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" /> Проверяем…
      </span>
    );
  }
  if (ping.state === "fail") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300">
        <span className="h-2 w-2 rounded-full bg-rose-400" /> Недоступен
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" /> {ping.ms} мс
    </span>
  );
}

export function ProviderDialog({ current, onSelect, onClose }: Props) {
  const [pings, setPings] = useState<Record<string, Ping>>({});
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPings(Object.fromEntries(PROVIDERS.map((p) => [p.id, { state: "checking" } as Ping])));
    PROVIDERS.forEach((p) => {
      pingProvider(p.id, round > 0)
        .then((ms) => !cancelled && setPings((s) => ({ ...s, [p.id]: { state: "ok", ms } })))
        .catch(() => !cancelled && setPings((s) => ({ ...s, [p.id]: { state: "fail" } })));
    });
    return () => {
      cancelled = true;
    };
  }, [round]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Выбор источника данных">
      <div className="absolute inset-0 animate-fade-in bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 max-h-[92dvh] w-full max-w-2xl animate-scale-in overflow-y-auto rounded-t-[28px] border border-white/10 bg-ink-900 p-5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] sm:rounded-[28px] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold-500/15 blur-[90px]" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Настройки</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">Источник данных</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
              Каталог, описания и плеер берутся из выбранного API. Переключайтесь в любой момент — избранное и история сохранятся.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white transition hover:bg-white hover:text-ink-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-6 space-y-3" role="radiogroup" aria-label="API">
          {PROVIDERS.map((p) => {
            const active = p.id === current;
            const Icon = ICONS[p.id];
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(p.id)}
                className={cn(
                  "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition duration-300 sm:p-5",
                  active
                    ? "border-gold-400/60 bg-gold-400/[0.07] shadow-[0_18px_50px_-24px_rgba(255,164,31,0.7)]"
                    : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]",
                )}
              >
                <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-ink-950 shadow-lg", p.accent)}>
                  <Icon className="h-6 w-6" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-semibold text-white">{p.name}</span>
                    {p.recommended && (
                      <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300 ring-1 ring-gold-400/30">
                        Главный
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-zinc-400">{p.tagline}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-1.5">
                    {featureChips(p).map((c) => (
                      <span key={c} className="rounded-md bg-white/[0.07] px-2 py-1 text-[11px] font-semibold text-zinc-300">
                        {c}
                      </span>
                    ))}
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3">
                    <code className="truncate text-[11px] text-zinc-500">{p.host}</code>
                    <PingBadge ping={pings[p.id]} />
                  </span>
                </span>

                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
                    active ? "border-gold-400 bg-gold-400 text-ink-950" : "border-white/25 text-transparent group-hover:border-white/50",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> Проверить снова
          </button>
          <p className="text-xs text-zinc-500">Если источник недоступен — выберите другой, каталог обновится сразу.</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
