import { useEffect, useState, type ReactNode } from "react";
import { Boxes, Clock, DatabaseZap, LayoutGrid, MousePointerClick, ShieldCheck, Split, Wand2 } from "lucide-react";
import { PROVIDERS } from "../../lib/providers/registry";
import type { ProviderId } from "../../lib/types";
import { cn } from "../../utils/cn";
import { PROVIDER_COLOR, Reveal, useReducedMotion } from "./common";

const CY: Record<ProviderId, number> = { tetrix: 76, evloev: 235, kodik: 394 };
const ORDER: ProviderId[] = ["tetrix", "evloev", "kodik"];
const CYCLE = 7.5;

const route = (id: ProviderId) =>
  `M160,235 L235,235 L410,235 C455,235 455,${CY[id]} 500,${CY[id]} L730,${CY[id]} C772,${CY[id]} 772,235 815,235 L990,235 L1045,235`;

const DETAIL: Record<ProviderId, { url: string; shape: string }> = {
  tetrix: { url: "/api/catalog?type=films&pageSize=36", shape: "{ data: [ … ], meta: { total, hasNextPage } }" },
  evloev: { url: "/api/list?token=…&type=films&limit=40", shape: "{ total, results: [ … ] }" },
  kodik: { url: "/list?token=…&types=foreign-movie,russian-movie", shape: "{ results: [ … ], next_page }" },
};

interface NodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  color?: string;
  children: ReactNode;
}

function NodeBox({ x, y, w, h, active, color, children }: NodeProps) {
  return (
    <foreignObject x={x} y={y} width={w} height={h}>
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center rounded-[22px] border bg-ink-800 px-3 text-center transition-all duration-500",
          active ? "-translate-y-1 border-gold-400/70" : "border-white/10",
        )}
        style={{
          boxShadow: active ? `0 0 0 1px ${color ?? "#ffbb55"}55, 0 18px 50px -12px ${color ?? "#ffbb55"}88` : "0 10px 30px -14px rgba(0,0,0,0.8)",
          borderColor: active && color ? `${color}bb` : undefined,
        }}
      >
        {children}
      </div>
    </foreignObject>
  );
}

const STEPS = [
  { icon: MousePointerClick, title: "Запрос", text: "Вы открываете каталог, ищете фильм или листаете страницу — интерфейс формирует параметры." },
  { icon: Wand2, title: "Адаптер", text: "Провайдер собирает URL под конкретный API и добавляет ключ, тип, год и пагинацию." },
  { icon: DatabaseZap, title: "Ответ API", text: "Сервер отвечает JSON. Если основной хост недоступен — включается резервный." },
  { icon: Boxes, title: "Нормализация", text: "Разные поля приводятся к единой модели Movie: постер, рейтинги, жанры, плеер." },
  { icon: LayoutGrid, title: "Интерфейс", text: "Карточки, страница фильма и плеер работают одинаково, какой бы источник вы ни выбрали." },
];

export function Pipeline() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<ProviderId>("tetrix");
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (hold) return undefined;
    const t = setInterval(() => setStep((s) => (s + 1) % 5), 1500);
    return () => clearInterval(t);
  }, [hold]);

  useEffect(() => {
    if (hold) return undefined;
    const t = setInterval(() => setActive((a) => ORDER[(ORDER.indexOf(a) + 1) % ORDER.length]), CYCLE * 1000);
    return () => clearInterval(t);
  }, [hold]);

  const provider = PROVIDERS.find((p) => p.id === active) ?? PROVIDERS[0];
  const detail = DETAIL[active];
  const color = PROVIDER_COLOR[active];

  const stepText = (i: number): string => {
    if (i === 1) return `Для ${provider.short}: ${detail.url}`;
    if (i === 2) return `${provider.short} возвращает ${detail.shape}`;
    return STEPS[i].text;
  };

  return (
    <div onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <Reveal>
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Показать путь данных:</span>
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              aria-pressed={active === p.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition",
                active === p.id ? "bg-white text-ink-950 ring-white" : "bg-white/[0.05] text-zinc-300 ring-white/10 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR[p.id] }} />
              {p.short}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-800/80 to-ink-900/90 p-3 md:p-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="no-scrollbar relative overflow-x-auto">
            <svg viewBox="0 0 1200 470" className="mx-auto h-auto w-full min-w-[940px]" role="img" aria-label="Схема: запрос проходит через адаптер к API, ответ нормализуется и попадает в интерфейс">
              <defs>
                {ORDER.map((id) => (
                  <linearGradient key={id} id={`pl-${id}`} gradientUnits="userSpaceOnUse" x1="160" y1="0" x2="1045" y2="0">
                    <stop offset="0" stopColor={PROVIDER_COLOR[id]} stopOpacity="0.25" />
                    <stop offset="0.5" stopColor={PROVIDER_COLOR[id]} />
                    <stop offset="1" stopColor={PROVIDER_COLOR[id]} stopOpacity="0.25" />
                  </linearGradient>
                ))}
                <filter id="pl-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {ORDER.filter((id) => id !== active).map((id) => (
                <path key={id} d={route(id)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
              ))}
              <path d={route(active)} fill="none" stroke={`url(#pl-${active})`} strokeWidth="3" strokeDasharray="6 8" className="api-dash" />

              {!reduced &&
                ORDER.map((id) =>
                  [0, 1, 2].map((k) => (
                    <circle key={`${id}-${k}`} r={id === active ? 6 : 3.5} fill={PROVIDER_COLOR[id]} opacity={id === active ? 1 : 0.32} filter={id === active ? "url(#pl-glow)" : undefined}>
                      <animateMotion dur={`${CYCLE}s`} begin={`${-k * (CYCLE / 3)}s`} repeatCount="indefinite" path={route(id)} />
                    </circle>
                  )),
                )}

              <g className="font-mono" fontSize="12" fill="#71717a" textAnchor="middle">
                <text x="197" y="222">params</text>
                <text x="452" y="214">HTTPS GET</text>
                <text x="772" y="214">JSON</text>
                <text x="1018" y="222">Movie[]</text>
              </g>

              <NodeBox x={10} y={185} w={150} h={100} active={step === 0}>
                <MousePointerClick className="h-6 w-6 text-gold-300" />
                <div className="mt-2 font-display text-[15px] font-semibold text-white">Интерфейс</div>
                <div className="text-[11px] text-zinc-500">каталог · поиск</div>
              </NodeBox>

              <NodeBox x={235} y={185} w={175} h={100} active={step === 1}>
                <Wand2 className="h-6 w-6 text-gold-300" />
                <div className="mt-2 font-display text-[15px] font-semibold text-white">Адаптер</div>
                <div className="text-[11px] text-zinc-500">строит запрос</div>
              </NodeBox>

              {ORDER.map((id) => {
                const p = PROVIDERS.find((x) => x.id === id) ?? PROVIDERS[0];
                return (
                  <NodeBox key={id} x={500} y={CY[id] - 46} w={230} h={92} active={step === 2 && active === id} color={PROVIDER_COLOR[id]}>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: PROVIDER_COLOR[id], boxShadow: `0 0 12px ${PROVIDER_COLOR[id]}` }} />
                      <span className="font-display text-[15px] font-semibold text-white">{p.name}</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-zinc-500">{p.host}</div>
                  </NodeBox>
                );
              })}

              <NodeBox x={815} y={185} w={175} h={100} active={step === 3}>
                <Boxes className="h-6 w-6 text-gold-300" />
                <div className="mt-2 font-display text-[15px] font-semibold text-white">Нормализатор</div>
                <div className="text-[11px] text-zinc-500">→ единый Movie</div>
              </NodeBox>

              <NodeBox x={1045} y={185} w={145} h={100} active={step === 4}>
                <LayoutGrid className="h-6 w-6 text-gold-300" />
                <div className="mt-2 font-display text-[15px] font-semibold text-white">Карточки</div>
                <div className="text-[11px] text-zinc-500">плеер · страница</div>
              </NodeBox>
            </svg>
          </div>

          <div className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => {
              const on = step === i;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setStep(i);
                    setHold(true);
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 text-left transition duration-500",
                    on ? "-translate-y-1 border-gold-400/50 bg-gold-400/[0.07] shadow-[0_18px_40px_-20px_rgba(255,164,31,0.7)]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                  )}
                >
                  {on && <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
                  <div className="flex items-center gap-2.5">
                    <span className={cn("grid h-8 w-8 place-items-center rounded-lg transition", on ? "bg-gold-400 text-ink-950" : "bg-white/[0.07] text-gold-300")}>
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-500">0{i + 1}</span>
                    <span className="font-display text-sm font-semibold text-white">{s.title}</span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{stepText(i)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {[
            { icon: Split, text: "Резервный хост для EvloevFilm" },
            { icon: Clock, text: "Кэш ответов — 5 минут" },
            { icon: ShieldCheck, text: "Тайм-аут запроса — 15 секунд" },
            { icon: Boxes, text: "Единая модель данных" },
          ].map((c) => (
            <span key={c.text} className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">
              <c.icon className="h-3.5 w-3.5 text-gold-400" />
              {c.text}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
