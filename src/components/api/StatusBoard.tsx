import { useState } from "react";
import { Activity, Check, Database, Film, KeyRound, Layers, RefreshCw, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { ENDPOINTS, PROVIDER_INFO } from "../../lib/apiDocs";
import { useProvider } from "../../lib/provider-context";
import { PROVIDERS } from "../../lib/providers/registry";
import type { ProviderId } from "../../lib/types";
import { cn } from "../../utils/cn";
import { PROVIDER_COLOR, Reveal, TiltCard, useCountUp } from "./common";
import type { Health, HealthMap } from "./health";

interface Props {
  health: HealthMap;
  onRefresh: () => void;
  onTry: (epId: string) => void;
}

const ICONS: Record<ProviderId, LucideIcon> = { tetrix: Database, evloev: Film, kodik: Sparkles };
const FIRST_ENDPOINT: Record<ProviderId, string> = { tetrix: "tetrix-catalog", evloev: "evloev-list", kodik: "kodik-list" };

const R = 38;
const C = 2 * Math.PI * R;

function tone(ms: number | null): { color: string; label: string } {
  if (ms === null) return { color: "#71717a", label: "…" };
  if (ms < 700) return { color: "#34d399", label: "Быстро" };
  if (ms < 1800) return { color: "#ffbb55", label: "Нормально" };
  return { color: "#fb7185", label: "Медленно" };
}

function Gauge({ h }: { h: Health }) {
  const ms = h.ms;
  const { color } = tone(h.state === "fail" ? 99999 : ms);
  const fraction = h.state === "ok" && ms !== null ? Math.max(0.06, Math.min(1, 1 - ms / 3000)) : h.state === "fail" ? 0.04 : 0.12;
  const shown = useCountUp(ms ?? 0, 900, ms !== null);

  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fraction)}
          className="api-ring-fill"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-xl font-bold leading-none text-white">{h.state === "fail" ? "—" : ms === null ? "…" : shown}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{h.state === "fail" ? "офлайн" : "мс"}</div>
        </div>
      </div>
    </div>
  );
}

function Spark({ values, color }: { values: number[]; color: string }) {
  const w = 220;
  const h = 46;
  if (values.length < 2) {
    return (
      <div className="flex h-[46px] items-center">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 6 - ((v - min) / span) * (h - 14)] as const);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const gid = `spark-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[46px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.4" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={color} />
    </svg>
  );
}

function Summary({ health, onRefresh }: { health: HealthMap; onRefresh: () => void }) {
  const [spin, setSpin] = useState(false);
  const list = PROVIDERS.map((p) => health[p.id]);
  const online = list.filter((h) => h.state === "ok").length;
  const oks = list.filter((h): h is Health & { ms: number } => h.state === "ok" && h.ms !== null);
  const avg = oks.length ? Math.round(oks.reduce((n, h) => n + h.ms, 0) / oks.length) : 0;
  const onlineShown = useCountUp(online, 700);
  const avgShown = useCountUp(avg, 900, avg > 0);

  return (
    <div className="glass mb-6 flex flex-wrap items-center gap-x-10 gap-y-4 rounded-3xl px-6 py-5">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
        </span>
        <span className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-300">Live</span>
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-white">
          {onlineShown}
          <span className="text-zinc-500"> / {PROVIDERS.length}</span>
        </div>
        <div className="text-xs font-semibold text-zinc-500">API онлайн</div>
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-white">
          {avg ? avgShown : "—"}
          <span className="ml-1 text-sm text-zinc-500">мс</span>
        </div>
        <div className="text-xs font-semibold text-zinc-500">средний отклик</div>
      </div>
      <p className="hidden text-xs text-zinc-500 md:block">Проверка каждые 25 секунд — прямо из вашего браузера</p>
      <button
        type="button"
        onClick={() => {
          setSpin(true);
          onRefresh();
          setTimeout(() => setSpin(false), 900);
        }}
        className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-bold text-white ring-1 ring-white/10 transition hover:bg-white/15"
      >
        <RefreshCw className={cn("h-4 w-4", spin && "animate-spin")} /> Проверить сейчас
      </button>
    </div>
  );
}

export function StatusBoard({ health, onRefresh, onTry }: Props) {
  const { provider: current, setProvider } = useProvider();

  return (
    <div>
      <Reveal>
        <Summary health={health} onRefresh={onRefresh} />
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-3">
        {PROVIDERS.map((p, i) => {
          const h = health[p.id];
          const Icon = ICONS[p.id];
          const info = PROVIDER_INFO[p.id];
          const t = tone(h.state === "fail" ? 99999 : h.ms);
          const count = ENDPOINTS.filter((e) => e.provider === p.id).length;
          const active = current.id === p.id;

          return (
            <Reveal key={p.id} delay={i * 110}>
              <TiltCard max={5} className="h-full rounded-3xl">
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-700/70 to-ink-800/90 p-6">
                  <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", p.accent)} />
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-3xl" style={{ background: PROVIDER_COLOR[p.id] }} />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <span className={cn("grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-ink-950 shadow-lg", p.accent)}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">{p.name}</h3>
                        <code className="text-[11px] text-zinc-500">{p.host}</code>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                        h.state === "ok" && "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
                        h.state === "fail" && "bg-rose-400/10 text-rose-300 ring-rose-400/30",
                        h.state === "checking" && "bg-white/5 text-zinc-400 ring-white/10",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", h.state === "ok" ? "bg-emerald-400" : h.state === "fail" ? "bg-rose-400" : "animate-pulse bg-zinc-500")} />
                      {h.state === "ok" ? "Онлайн" : h.state === "fail" ? "Недоступен" : "Проверяем"}
                    </span>
                  </div>

                  <p className="relative mt-4 text-sm leading-relaxed text-zinc-400">{p.tagline}</p>

                  <div className="relative mt-6 flex items-center gap-5">
                    <Gauge h={h} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5" /> история
                        </span>
                        <span style={{ color: t.color }}>{t.label}</span>
                      </div>
                      <Spark values={h.history} color={t.color === "#71717a" ? PROVIDER_COLOR[p.id] : t.color} />
                    </div>
                  </div>

                  <dl className="relative mt-6 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <KeyRound className="h-4 w-4 shrink-0 text-gold-400" />
                      <dt className="sr-only">Доступ</dt>
                      <dd>{info.auth}</dd>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <Layers className="h-4 w-4 shrink-0 text-gold-400" />
                      <dt className="sr-only">Пагинация</dt>
                      <dd>{info.pagination}</dd>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <Zap className="h-4 w-4 shrink-0 text-gold-400" />
                      <dt className="sr-only">Методы</dt>
                      <dd>
                        {count} {count === 1 ? "метод" : count < 5 ? "метода" : "методов"} в справочнике
                      </dd>
                    </div>
                  </dl>

                  <div className="relative mt-6 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => onTry(FIRST_ENDPOINT[p.id])}
                      className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
                    >
                      Открыть в тестере
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvider(p.id)}
                      disabled={active}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ring-1 transition",
                        active ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30" : "bg-white/[0.06] text-white ring-white/10 hover:bg-white/12",
                      )}
                    >
                      {active && <Check className="h-4 w-4" />}
                      {active ? "Используется на сайте" : "Использовать на сайте"}
                    </button>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
