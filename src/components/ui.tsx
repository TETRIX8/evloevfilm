import type { ReactNode } from "react";
import { ChevronRight, Database, RefreshCw, Terminal, type LucideIcon } from "lucide-react";
import { useProvider } from "../lib/provider-context";
import { navigate } from "../lib/router";
import { cn } from "../utils/cn";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("shrink-0", className)} aria-hidden="true">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-ink-700 ring-1 ring-white/5">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="mt-3 h-3.5 w-3/4 rounded-md bg-ink-700" />
      <div className="mt-2 h-3 w-1/2 rounded-md bg-ink-800" />
    </div>
  );
}

interface HeadingProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeading({ icon: Icon, title, subtitle, actionLabel, onAction }: HeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {Icon ? (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-400/25">
            <Icon className="h-5 w-5" />
          </span>
        ) : (
          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-gold-300 to-gold-600" />
        )}
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-white md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="group hidden shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-gold-300 sm:inline-flex"
        >
          {actionLabel ?? "Смотреть все"}
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

interface StateProps {
  icon: LucideIcon;
  title: string;
  text?: string;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, text, children }: StateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-ink-600 to-ink-800 text-gold-400 ring-1 ring-white/10">
        <Icon className="h-9 w-9" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      {text && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function ErrorState({ onRetry, compact }: { onRetry: () => void; compact?: boolean }) {
  const { provider, openDialog } = useProvider();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
      )}
    >
      <p className="max-w-md text-sm leading-relaxed text-zinc-300">
        Источник «{provider.name}» сейчас не отвечает. Повторите попытку или выберите другой API.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <RefreshCw className="h-4 w-4" /> Повторить
        </button>
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-2 text-sm font-semibold text-gold-300 ring-1 ring-gold-400/30 transition hover:bg-gold-400/25"
        >
          <Database className="h-4 w-4" /> Сменить источник
        </button>
        <button
          type="button"
          onClick={() => navigate({ name: "api" })}
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-zinc-200 ring-1 ring-white/10 transition hover:bg-white/12"
        >
          <Terminal className="h-4 w-4" /> Статус API
        </button>
      </div>
    </div>
  );
}
