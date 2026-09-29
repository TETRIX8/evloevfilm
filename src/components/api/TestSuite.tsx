import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, CircleDashed, Loader2, Play, RotateCw, X } from "lucide-react";
import { resetCaches, runTest, TEST_PROVIDERS, TESTS, type TestDef, type TestResult } from "../../lib/apiTests";
import { useInView } from "../../lib/hooks";
import { PROVIDERS } from "../../lib/providers/registry";
import type { ProviderId } from "../../lib/types";
import { cn } from "../../utils/cn";
import { PROVIDER_COLOR, Reveal } from "./common";

interface Props {
  runNonce: number;
}

const R = 54;
const C = 2 * Math.PI * R;
type Phase = "idle" | "running" | "done";

function StateIcon({ state }: { state: TestResult["state"] }) {
  const base = "grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1";
  switch (state) {
    case "running":
      return (
        <span className={cn(base, "bg-gold-400/10 text-gold-300 ring-gold-400/30")}>
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      );
    case "pass":
      return (
        <span key="pass" className={cn(base, "api-pop bg-emerald-400/15 text-emerald-300 ring-emerald-400/40 shadow-[0_0_20px_-4px_rgba(52,211,153,0.7)]")}>
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      );
    case "warn":
      return (
        <span key="warn" className={cn(base, "api-pop bg-amber-400/15 text-amber-300 ring-amber-400/40")}>
          <AlertTriangle className="h-4 w-4" />
        </span>
      );
    case "fail":
      return (
        <span key="fail" className={cn(base, "api-pop bg-rose-400/15 text-rose-300 ring-rose-400/40")}>
          <X className="h-4 w-4" strokeWidth={3} />
        </span>
      );
    default:
      return (
        <span className={cn(base, "bg-white/[0.04] text-zinc-600 ring-white/10")}>
          <CircleDashed className="h-4 w-4" />
        </span>
      );
  }
}

function Row({ t, r, index, onRerun, disabled }: { t: TestDef; r: TestResult; index: number; onRerun: () => void; disabled: boolean }) {
  const ms = r.ms ?? 0;
  const bar = Math.min(100, (ms / 2500) * 100);
  const barColor = r.state === "fail" ? "bg-rose-400" : ms < 700 ? "bg-emerald-400" : ms < 1800 ? "bg-gold-400" : "bg-rose-400";

  return (
    <li className="api-row-in group relative rounded-2xl px-3 py-3 transition hover:bg-white/[0.04]" style={{ animationDelay: `${index * 45}ms` }}>
      <div className="flex items-start gap-3">
        <StateIcon state={r.state} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold text-white">{t.title}</span>
            <span className="shrink-0 font-mono text-xs font-semibold text-zinc-500">{r.ms !== undefined ? `${r.ms} мс` : r.state === "running" ? "…" : ""}</span>
          </div>
          <div className="mt-0.5 truncate font-mono text-[11px] text-zinc-600" title={t.endpoint}>
            {t.endpoint}
          </div>
          {(r.state === "pass" || r.state === "warn" || r.state === "fail") && r.detail && (
            <div className={cn("api-code-in mt-1.5 text-xs", r.state === "fail" ? "text-rose-300" : r.state === "warn" ? "text-amber-300" : "text-zinc-400")}>{r.detail}</div>
          )}
          {r.ms !== undefined && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barColor)} style={{ width: `${Math.max(4, bar)}%` }} />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onRerun}
          disabled={disabled}
          aria-label={`Повторить тест: ${t.title}`}
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-600 opacity-0 transition hover:bg-white/10 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 disabled:hidden [@media(hover:none)]:opacity-100"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

export function TestSuite({ runNonce }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const near = useInView(wrapRef, "0px");
  const started = useRef(false);
  const running = useRef(false);

  const [states, setStates] = useState<Record<string, TestResult>>(() => Object.fromEntries(TESTS.map((t) => [t.id, { state: "idle" as const }])));
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);

  const runAll = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    started.current = true;
    setPhase("running");
    resetCaches();
    const t0 = performance.now();
    setStates(Object.fromEntries(TESTS.map((t) => [t.id, { state: "queued" as const }])));

    await Promise.all(
      TEST_PROVIDERS.map(async (pid) => {
        for (const t of TESTS.filter((x) => x.provider === pid)) {
          setStates((s) => ({ ...s, [t.id]: { state: "running" } }));
          const res = await runTest(t);
          setStates((s) => ({ ...s, [t.id]: res }));
        }
      }),
    );

    setElapsed(Math.round(performance.now() - t0));
    running.current = false;
    setPhase("done");
  }, []);

  const rerun = useCallback(async (t: TestDef) => {
    if (running.current) return;
    setStates((s) => ({ ...s, [t.id]: { state: "running" } }));
    const res = await runTest(t);
    setStates((s) => ({ ...s, [t.id]: res }));
  }, []);

  useEffect(() => {
    if (near && !started.current) void runAll();
  }, [near, runAll]);

  useEffect(() => {
    if (runNonce > 0) void runAll();
  }, [runNonce, runAll]);

  const stats = useMemo(() => {
    const all = Object.values(states);
    const finished = all.filter((s) => s.state === "pass" || s.state === "warn" || s.state === "fail").length;
    const pass = all.filter((s) => s.state === "pass").length;
    const warn = all.filter((s) => s.state === "warn").length;
    const fail = all.filter((s) => s.state === "fail").length;
    return { total: TESTS.length, finished, pass, warn, fail };
  }, [states]);

  const avg = useMemo(() => {
    const out = {} as Record<ProviderId, number>;
    TEST_PROVIDERS.forEach((pid) => {
      const ms = TESTS.filter((t) => t.provider === pid)
        .map((t) => states[t.id])
        .filter((s) => (s.state === "pass" || s.state === "warn") && s.ms !== undefined)
        .map((s) => s.ms as number);
      out[pid] = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0;
    });
    return out;
  }, [states]);

  const progress = stats.finished / stats.total;
  const okRatio = stats.finished ? (stats.pass + stats.warn) / stats.finished : 0;
  const done = phase === "done";
  const ringColor = !done ? "#ffbb55" : stats.fail > 0 ? (okRatio >= 0.7 ? "#ffbb55" : "#fb7185") : stats.warn > 0 ? "#fbbf24" : "#34d399";
  const verdict = !done
    ? phase === "running"
      ? "Проверяем API…"
      : "Готовы к запуску"
    : stats.fail === 0
      ? stats.warn === 0
        ? "Всё работает отлично"
        : "Всё работает, есть замечания"
      : stats.fail === stats.total
        ? "API недоступны"
        : "Есть проблемы";
  const maxAvg = Math.max(1, ...Object.values(avg));

  return (
    <div ref={wrapRef}>
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-ink-700/70 via-ink-800 to-ink-900 p-6 md:p-8">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full blur-[100px] transition-colors duration-700" style={{ background: `${ringColor}33` }} />

          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
            <div className="relative mx-auto h-[150px] w-[150px]">
              <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
                <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                <circle
                  cx="65"
                  cy="65"
                  r={R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - (done ? okRatio : progress))}
                  className="api-ring-fill"
                  style={{ filter: `drop-shadow(0 0 8px ${ringColor})` }}
                />
              </svg>
              {phase === "running" && <span className="api-orbit absolute inset-2 rounded-full border border-dashed border-gold-400/25" />}
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-display text-3xl font-bold text-white">
                    {done ? stats.pass + stats.warn : stats.finished}
                    <span className="text-lg text-zinc-500">/{stats.total}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{done ? "прошли" : "проверено"}</div>
                </div>
              </div>
            </div>

            <div className="min-w-0 text-center md:text-left">
              <p className="font-display text-xl font-bold text-white md:text-2xl" style={{ color: done ? ringColor : undefined }}>
                {verdict}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/25">
                  <Check className="h-3.5 w-3.5" /> {stats.pass} успешно
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/25">
                  <AlertTriangle className="h-3.5 w-3.5" /> {stats.warn} замечаний
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300 ring-1 ring-rose-400/25">
                  <X className="h-3.5 w-3.5" /> {stats.fail} ошибок
                </span>
                {done && <span className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-300 ring-1 ring-white/10">{(elapsed / 1000).toFixed(1)} с всего</span>}
              </div>

              <div className="mt-5 space-y-2.5">
                {PROVIDERS.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs font-bold text-zinc-400">{p.short}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-out"
                        style={{ width: `${avg[p.id] ? Math.max(6, (avg[p.id] / maxAvg) * 100) : 0}%`, background: PROVIDER_COLOR[p.id], boxShadow: `0 0 12px ${PROVIDER_COLOR[p.id]}88` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-xs font-semibold text-zinc-400">{avg[p.id] ? `${avg[p.id]} мс` : "—"}</span>
                  </div>
                ))}
                <p className="text-[11px] text-zinc-600">Среднее время ответа по успешным тестам</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void runAll()}
              disabled={phase === "running"}
              className="btn-gold mx-auto inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-base font-extrabold disabled:opacity-70 md:mx-0"
            >
              {phase === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? <RotateCw className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              {phase === "running" ? "Идёт проверка" : done ? "Запустить снова" : "Запустить все тесты"}
            </button>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {PROVIDERS.map((p, gi) => {
          const list = TESTS.filter((t) => t.provider === p.id);
          const okCount = list.filter((t) => states[t.id].state === "pass" || states[t.id].state === "warn").length;
          const doneCount = list.filter((t) => ["pass", "warn", "fail"].includes(states[t.id].state)).length;
          return (
            <Reveal key={p.id} delay={gi * 90}>
              <div className="h-full overflow-hidden rounded-3xl border border-white/10 bg-ink-800/80">
                <div className="relative border-b border-white/5 px-5 py-4">
                  <div className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", p.accent)} />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-white">{p.name}</h3>
                      <code className="text-[11px] text-zinc-500">{p.host}</code>
                    </div>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-xs font-bold text-zinc-300 ring-1 ring-white/10">
                      {okCount}/{list.length}
                    </span>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(doneCount / list.length) * 100}%`, background: PROVIDER_COLOR[p.id] }} />
                  </div>
                </div>
                <ul className="space-y-0.5 p-2">
                  {list.map((t, i) => (
                    <Row key={t.id} t={t} r={states[t.id]} index={i} onRerun={() => void rerun(t)} disabled={phase === "running"} />
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
