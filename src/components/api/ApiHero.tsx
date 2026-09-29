import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Braces, FlaskConical, Radio } from "lucide-react";
import { ENDPOINTS } from "../../lib/apiDocs";
import { TESTS } from "../../lib/apiTests";
import { PROVIDERS } from "../../lib/providers/registry";
import { cn } from "../../utils/cn";
import { highlight, PROVIDER_COLOR, TiltCard, useCountUp } from "./common";
import type { HealthMap } from "./health";

interface Props {
  health: HealthMap;
  onPlayground: () => void;
  onTests: () => void;
}

interface Script {
  name: string;
  color: string;
  cmd: string;
  status: string;
  body: string[];
}

const SCRIPTS: Script[] = [
  {
    name: "TetrixFilm",
    color: PROVIDER_COLOR.tetrix,
    cmd: 'curl "https://tetrixfilm.ru/api/catalog?type=films&pageSize=1"',
    status: "200 OK · application/json",
    body: [
      "{",
      '  "data": [{',
      '    "title": "Переводчик",',
      '    "originalTitle": "The Covenant",',
      '    "year": 2023,',
      '    "ratings": { "kinopoisk": { "rating": 7.9 } },',
      '    "genres": [{ "name": "Боевик" }, { "name": "Триллер" }],',
      '    "playerUrl": "https://…/iframe?movie_id=632"',
      "  }],",
      '  "meta": { "page": 1, "pageSize": 1, "hasNextPage": true }',
      "}",
    ],
  },
  {
    name: "EvloevFilm",
    color: PROVIDER_COLOR.evloev,
    cmd: 'curl "https://evloevfilmapi.vercel.app/api/list?type=films&sort=-views&limit=1"',
    status: "200 OK · application/json",
    body: [
      "{",
      '  "total": 67488,',
      '  "results": [{',
      '    "name": "Человек-паук: Новый день",',
      '    "year": 2026,',
      '    "kinopoisk": "7.8",',
      '    "imdb": "8.2",',
      '    "quality": "FHD (1080p)",',
      '    "iframe_url": "https://…/embed/movie/90039"',
      "  }]",
      "}",
    ],
  },
  {
    name: "Kodik",
    color: PROVIDER_COLOR.kodik,
    cmd: 'curl "https://kodikapi.com/list?types=anime-serial&limit=1&with_material_data=true"',
    status: "200 OK · пример ответа (сокращён)",
    body: [
      "{",
      '  "results": [{',
      '    "title": "Атака титанов",',
      '    "type": "anime-serial",',
      '    "year": 2013,',
      '    "translation": { "title": "AniLibria" },',
      '    "link": "//kodikplayer.com/serial/…",',
      '    "material_data": { "shikimori_rating": 8.5 }',
      "  }],",
      '  "next_page": "https://kodikapi.com/list?next=…"',
      "}",
    ],
  },
];

interface Line {
  kind: "cmd" | "status" | "json";
  text: string;
}

function Terminal() {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const script = SCRIPTS[idx];

  const lines = useMemo<Line[]>(
    () => [
      { kind: "cmd", text: script.cmd },
      { kind: "status", text: script.status },
      ...script.body.map((text) => ({ kind: "json" as const, text })),
    ],
    [script],
  );
  const total = useMemo(() => lines.reduce((n, l) => n + l.text.length + 1, 0), [lines]);

  useEffect(() => {
    const typingCmd = chars < script.cmd.length;
    if (chars < total) {
      const t = setTimeout(() => setChars((c) => Math.min(total, c + (typingCmd ? 1 : 3))), typingCmd ? 20 : 11);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % SCRIPTS.length);
      setChars(0);
    }, 3400);
    return () => clearTimeout(t);
  }, [chars, total, script]);

  let left = chars;
  const shown: Line[] = [];
  for (const l of lines) {
    if (left <= 0) break;
    shown.push({ ...l, text: l.text.slice(0, Math.min(left, l.text.length)) });
    left -= l.text.length + 1;
  }

  return (
    <TiltCard max={6} className="api-border rounded-3xl">
      <div className="relative overflow-hidden rounded-3xl bg-ink-900/90 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95),0_0_80px_-20px_rgba(255,164,31,0.35)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-300/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex flex-1 gap-1.5 overflow-x-auto no-scrollbar">
            {SCRIPTS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  setIdx(i);
                  setChars(0);
                }}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition",
                  i === idx ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: s.color }} />
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[318px] overflow-hidden p-5 font-mono text-[12.5px] leading-[1.75] text-zinc-200 sm:min-h-[336px]">
          {shown.map((l, i) => {
            const last = i === shown.length - 1;
            const caret = last ? <span className="api-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-gold-300" /> : null;
            if (l.kind === "cmd") {
              return (
                <div key={i} className="break-all">
                  <span className="mr-2 font-bold text-gold-400">$</span>
                  {highlight(l.text, "bash")}
                  {caret}
                </div>
              );
            }
            if (l.kind === "status") {
              return (
                <div key={i} className="my-1 flex items-center gap-2 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  {l.text}
                  {caret}
                </div>
              );
            }
            return (
              <div key={i} className="whitespace-pre-wrap break-all">
                {highlight(l.text, "json")}
                {caret}
              </div>
            );
          })}
        </div>
      </div>
    </TiltCard>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  const n = useCountUp(value);
  return (
    <div>
      <div className="font-display text-3xl font-bold text-white md:text-4xl">{n}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

const CHIPS = [
  { text: "GET /api/catalog", cls: "left-0 top-4 xl:-left-10", r: "-4deg", delay: "0s" },
  { text: "200 OK", cls: "right-2 top-0 xl:-right-6", r: "5deg", delay: "-2s" },
  { text: "application/json", cls: "right-0 bottom-20 xl:-right-10", r: "-3deg", delay: "-4s" },
  { text: "POST /api/rooms", cls: "left-6 -bottom-4 xl:-left-8", r: "3deg", delay: "-1s" },
];

export function ApiHero({ health, onPlayground, onTests }: Props) {
  const tryable = ENDPOINTS.length;

  return (
    <section id="overview" className="relative isolate scroll-mt-44 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-gold-500/15 blur-[130px]" />
        <div className="absolute -right-32 top-32 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="api-floor" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-40 md:pt-36 lg:grid-cols-[1.02fr_1fr] lg:px-8 lg:pb-32">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold-300 ring-1 ring-gold-400/30">
            <Braces className="h-3.5 w-3.5" />
            Developer Hub · /api
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight text-white">
            Смотрите, как <span className="gold-text">работает</span> каждый API
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300">
            Живой статус, интерактивный тестер запросов, автоматические тесты и наглядная схема — всё, что стоит за каталогом EVOLVEFILM, в одном месте.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={onPlayground} className="btn-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-extrabold">
              Открыть тестер <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onTests}
              className="glass inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/15"
            >
              <FlaskConical className="h-5 w-5 text-gold-300" /> Запустить тесты
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {PROVIDERS.map((p) => {
              const h = health[p.id];
              return (
                <span key={p.id} className="glass inline-flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-sm font-semibold text-zinc-200">
                  <span className="relative flex h-2.5 w-2.5">
                    {h.state === "ok" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />}
                    <span
                      className={cn(
                        "relative inline-flex h-2.5 w-2.5 rounded-full",
                        h.state === "ok" ? "bg-emerald-400" : h.state === "fail" ? "bg-rose-400" : "animate-pulse bg-zinc-500",
                      )}
                    />
                  </span>
                  {p.short}
                  <span className="font-mono text-xs text-zinc-400">{h.state === "ok" ? `${h.ms} мс` : h.state === "fail" ? "офлайн" : "…"}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-10 flex gap-10 border-t border-white/10 pt-8">
            <Counter value={PROVIDERS.length} label="источника" />
            <Counter value={tryable} label="методов API" />
            <Counter value={TESTS.length} label="авто-тестов" />
          </div>
        </div>

        <div className="relative animate-scale-in" style={{ animationDelay: "0.15s" }}>
          <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-gold-500/15 blur-[90px]" />
          {CHIPS.map((c) => (
            <span
              key={c.text}
              aria-hidden="true"
              className={cn("api-bob glass absolute z-20 hidden rounded-full px-3.5 py-1.5 font-mono text-xs font-bold text-gold-200 shadow-xl sm:block", c.cls)}
              style={{ ["--r" as string]: c.r, animationDelay: c.delay }}
            >
              {c.text}
            </span>
          ))}
          <Terminal />
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 lg:justify-start">
            <Radio className="h-3.5 w-3.5 text-emerald-400" /> Пример запроса и ответа — попробуйте свой в тестере ниже
          </p>
        </div>
      </div>
    </section>
  );
}
