import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Braces, ChevronDown, Globe, LayoutGrid, Loader2, Monitor, Play, Server, Wand2, XCircle } from "lucide-react";
import {
  buildUrl,
  buildUrls,
  defaultValues,
  ENDPOINTS,
  formatBytes,
  maskSecrets,
  normalizeResponse,
  PRESETS,
  rawItems,
  runRequest,
  snippetFor,
  summarize,
  type EndpointDef,
  type ParamDef,
  type RawResult,
  type SnippetLang,
} from "../../lib/apiDocs";
import { useInView } from "../../lib/hooks";
import { PROVIDERS } from "../../lib/providers/registry";
import type { Movie, ProviderId } from "../../lib/types";
import { cn } from "../../utils/cn";
import { MovieCard } from "../MovieCard";
import { CodeBlock, CopyButton, highlight, MethodBadge, PROVIDER_COLOR, useCopy } from "./common";
import { JsonView } from "./JsonView";

export interface PlaygroundRequest {
  nonce: number;
  epId: string;
  values?: Record<string, string>;
}

interface Props {
  request: PlaygroundRequest | null;
  onOpen: (m: Movie, play?: boolean) => void;
}

type Tab = "json" | "cards" | "model";

const TRYABLE = ENDPOINTS.filter((e) => e.tryable);
const inputCls =
  "w-full rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none transition placeholder:text-zinc-600 hover:bg-white/[0.09] focus:bg-white/10 focus:ring-gold-400/60";

function Field({ p, value, onChange, onEnter }: { p: ParamDef; value: string; onChange: (v: string) => void; onEnter: () => void }) {
  const onKey = (e: KeyboardEvent) => e.key === "Enter" && onEnter();
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-bold text-zinc-400">
        <span>{p.label}</span>
        {p.hint && <span className="font-medium text-zinc-600">{p.hint}</span>}
      </span>
      {p.kind === "select" ? (
        <span className="relative block">
          <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "cursor-pointer appearance-none pr-9")}>
            {(p.options ?? []).map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-800">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </span>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          type={p.kind === "number" ? "number" : "text"}
          inputMode={p.kind === "number" ? "numeric" : undefined}
          min={p.kind === "number" ? 1 : undefined}
          placeholder={p.placeholder}
          className={inputCls}
        />
      )}
    </label>
  );
}

function Flight({ loading, result, host }: { loading: boolean; result: RawResult | null; host: string }) {
  const ok = result?.ok;
  const lineColor = loading ? "rgba(255,187,85,0.45)" : !result ? "rgba(255,255,255,0.12)" : ok ? "rgba(52,211,153,0.6)" : "rgba(251,113,133,0.6)";
  return (
    <div className="relative mt-4 h-[74px] select-none" aria-hidden="true">
      <div className="absolute left-[6%] right-[6%] top-[22px] h-0.5 rounded-full transition-colors duration-500" style={{ background: lineColor }} />
      {loading && <div className="api-scan absolute left-[6%] right-[6%] top-[21px] h-1 rounded-full" />}
      {loading && (
        <div className="absolute inset-x-0 top-[22px] h-0">
          <span className="api-flight-dot" />
        </div>
      )}
      {[
        { left: "6%", icon: Monitor, label: "Браузер" },
        { left: "50%", icon: Server, label: host },
        { left: "94%", icon: Braces, label: "Ответ" },
      ].map((n, i) => (
        <div key={n.label} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: n.left }}>
          <span
            className={cn(
              "mx-auto grid h-11 w-11 place-items-center rounded-2xl border bg-ink-800 transition duration-500",
              loading ? "border-gold-400/50 text-gold-300" : result ? (i === 2 && !ok ? "border-rose-400/50 text-rose-300" : "border-emerald-400/40 text-emerald-300") : "border-white/10 text-zinc-500",
            )}
          >
            <n.icon className="h-5 w-5" />
          </span>
          <span className="mt-1.5 block max-w-[130px] truncate font-mono text-[10px] font-semibold text-zinc-500">{n.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatusChip({ r }: { r: RawResult }) {
  const cls = r.status >= 200 && r.status < 300 ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" : r.status >= 300 && r.status < 400 ? "bg-sky-400/15 text-sky-300 ring-sky-400/30" : "bg-rose-400/15 text-rose-300 ring-rose-400/30";
  return (
    <span className={cn("api-pop inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs font-extrabold ring-1", cls)}>
      {r.status === 0 ? "НЕТ ОТВЕТА" : `${r.status} ${r.statusText || (r.ok ? "OK" : "")}`.trim()}
    </span>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={cn("api-pop inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-bold ring-1 ring-white/10", tone ?? "text-zinc-300")}>{children}</span>;
}

export function Playground({ request, onOpen }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const near = useInView(wrapRef, "150px");
  const autoRan = useRef(false);
  const runId = useRef(0);

  const [epId, setEpId] = useState("tetrix-catalog");
  const [store, setStore] = useState<Record<string, Record<string, string>>>({});
  const [result, setResult] = useState<RawResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("json");
  const [lang, setLang] = useState<SnippetLang>("bash");
  const { copied, copy } = useCopy();

  const ep = ENDPOINTS.find((e) => e.id === epId) ?? TRYABLE[0];
  const values = store[epId] ?? defaultValues(ep);
  const providerId = ep.provider;
  const url = buildUrl(ep, values);
  const providerEps = TRYABLE.filter((e) => e.provider === providerId);

  const run = useCallback(async (e: EndpointDef, v: Record<string, string>) => {
    const id = ++runId.current;
    setLoading(true);
    const res = await runRequest(buildUrls(e, v));
    if (id !== runId.current) return;
    setResult(res);
    setLoading(false);
    setTab("json");
  }, []);

  // open a specific request from another block (status cards, reference)
  useEffect(() => {
    if (!request) return;
    const e = ENDPOINTS.find((x) => x.id === request.epId);
    if (!e) return;
    autoRan.current = true;
    const vals = { ...defaultValues(e), ...request.values };
    setEpId(e.id);
    setStore((s) => ({ ...s, [e.id]: vals }));
    setResult(null);
    void run(e, vals);
  }, [request, run]);

  // a first live request once the block scrolls into view
  useEffect(() => {
    if (near && !autoRan.current) {
      autoRan.current = true;
      void run(ep, values);
    }
  }, [near, ep, values, run]);

  const setValue = (key: string, v: string) => setStore((s) => ({ ...s, [epId]: { ...(s[epId] ?? defaultValues(ep)), [key]: v } }));

  const pickProvider = (pid: ProviderId) => {
    const first = TRYABLE.find((e) => e.provider === pid);
    if (first) {
      setEpId(first.id);
      setResult(null);
    }
  };

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    const e = preset && ENDPOINTS.find((x) => x.id === preset.epId);
    if (!preset || !e) return;
    const vals = { ...defaultValues(e), ...preset.values };
    setEpId(e.id);
    setStore((s) => ({ ...s, [e.id]: vals }));
    void run(e, vals);
  };

  const movies = useMemo(() => (result?.json ? normalizeResponse(ep, result.json) : null), [ep, result]);
  const first = useMemo(() => (result?.json ? rawItems(ep, result.json)[0] : undefined), [ep, result]);
  const summary = useMemo(() => (result?.json ? summarize(ep, result.json) : null), [ep, result]);

  const tabs: { id: Tab; label: string; icon: typeof Braces; hidden?: boolean }[] = [
    { id: "json", label: "Ответ JSON", icon: Braces },
    { id: "cards", label: `Карточки${movies ? ` · ${Math.min(movies.length, 10)}` : ""}`, icon: LayoutGrid, hidden: !movies },
    { id: "model", label: "Нормализация", icon: Wand2, hidden: !movies },
  ];

  const speed = result && result.status > 0 ? (result.ms < 700 ? "быстро" : result.ms < 1800 ? "нормально" : "медленно") : null;

  return (
    <div ref={wrapRef}>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-700/60 to-ink-800/90 p-5 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-[100px]" />

        {/* provider + endpoint */}
        <div className="relative flex flex-wrap items-center gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pickProvider(p.id)}
              aria-pressed={providerId === p.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ring-1 transition",
                providerId === p.id ? "bg-white text-ink-950 ring-white shadow-lg" : "bg-white/[0.05] text-zinc-300 ring-white/10 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR[p.id] }} />
              {p.name}
            </button>
          ))}
        </div>

        <div className="no-scrollbar relative mt-3 flex gap-2 overflow-x-auto pb-1">
          {providerEps.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setEpId(e.id);
                setResult(null);
              }}
              aria-pressed={e.id === epId}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold ring-1 transition",
                e.id === epId ? "bg-gold-400/15 text-gold-200 ring-gold-400/40" : "bg-white/[0.04] text-zinc-400 ring-white/10 hover:bg-white/[0.08] hover:text-white",
              )}
            >
              <MethodBadge method={e.method} className="!px-1.5 !py-0.5 !text-[10px]" />
              <span className="font-mono text-xs">{e.path}</span>
            </button>
          ))}
        </div>

        <p className="relative mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400">{ep.summary}</p>

        {/* params */}
        {ep.params.length > 0 && (
          <div className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ep.params.map((p) => (
              <Field key={p.key} p={p} value={values[p.key] ?? ""} onChange={(v) => setValue(p.key, v)} onEnter={() => void run(ep, values)} />
            ))}
          </div>
        )}

        {/* url bar */}
        <div className="relative mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-950/70 p-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <MethodBadge method={ep.method} />
            <div className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12.5px] text-zinc-200">
              <Globe className="mr-2 inline h-3.5 w-3.5 -translate-y-px text-zinc-600" />
              {highlight(maskSecrets(url), "bash")}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyButton copied={copied === "url"} onClick={() => void copy(url, "url")} label="URL" />
            <button
              type="button"
              onClick={() => void run(ep, values)}
              disabled={loading}
              className="btn-gold inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
              {loading ? "Запрос…" : "Выполнить"}
            </button>
          </div>
        </div>

        <Flight loading={loading} result={result} host={new URL(url).host} />

        {/* presets */}
        <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-white/5 pt-5">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Быстрые примеры</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-zinc-300 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-gold-400/10 hover:text-gold-200 hover:ring-gold-400/30"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* response */}
      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-ink-800/80">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-white/5 px-5 py-4">
          <h3 className="mr-2 font-display text-base font-semibold text-white">Ответ</h3>
          {loading && (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Ждём ответа сервера…
            </span>
          )}
          {!loading && !result && <span className="text-sm text-zinc-500">Нажмите «Выполнить», чтобы увидеть ответ</span>}
          {!loading && result && (
            <>
              <StatusChip r={result} />
              <Chip tone={result.ms < 700 ? "text-emerald-300" : result.ms < 1800 ? "text-gold-300" : "text-rose-300"}>
                {result.ms} мс{speed ? ` · ${speed}` : ""}
              </Chip>
              {result.bytes > 0 && <Chip>{formatBytes(result.bytes)}</Chip>}
              {summary?.count != null && (
                <Chip>
                  {summary.count} {summary.noun}
                  {summary.total != null ? ` из ${summary.total.toLocaleString("ru-RU")}` : ""}
                </Chip>
              )}
            </>
          )}
        </div>

        {result && !loading && (
          <div className="border-b border-white/5 px-3 pt-3">
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {tabs
                .filter((t) => !t.hidden)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-bold transition",
                      tab === t.id ? "bg-white/[0.07] text-white shadow-[inset_0_-2px_0_#ffbb55]" : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="p-5">
          {!result && !loading && (
            <div className="grid place-items-center py-14 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/[0.05] text-gold-400 ring-1 ring-white/10">
                <Play className="h-7 w-7" />
              </div>
              <p className="mt-4 max-w-sm text-sm text-zinc-500">Настройте параметры или выберите быстрый пример — запрос уйдёт напрямую с вашего устройства.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-2.5 py-2" aria-hidden="true">
              {[92, 70, 84, 58, 76, 46].map((w, i) => (
                <div key={i} className="relative h-4 overflow-hidden rounded-md bg-ink-700" style={{ width: `${w}%` }}>
                  <div className="shimmer absolute inset-0" />
                </div>
              ))}
            </div>
          )}

          {!loading && result && result.error && (
            <div className="api-code-in flex items-start gap-4 rounded-2xl border border-rose-400/25 bg-rose-400/[0.06] p-5">
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-300" />
              <div>
                <p className="font-semibold text-rose-200">{result.error}</p>
                <p className="mt-1.5 text-sm text-zinc-400">Попробуйте ещё раз или выберите другой источник — переключатель находится в шапке сайта.</p>
              </div>
            </div>
          )}

          {!loading && result && !result.error && tab === "json" && (
            <div className="api-code-in" key={`${result.url}-${result.ms}`}>
              {result.json !== null ? (
                <JsonView value={result.json} />
              ) : (
                <pre className="max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-ink-950/80 p-4 font-mono text-xs leading-relaxed text-zinc-300">
                  {result.text || "(пустой ответ)"}
                </pre>
              )}
              {!result.ok && result.json === null && (
                <p className="mt-3 text-sm text-zinc-500">Сервер вернул не JSON. Скорее всего, такого метода нет или он требует другого запроса.</p>
              )}
            </div>
          )}

          {!loading && result && tab === "cards" && movies && (
            <div className="api-code-in">
              <p className="mb-5 text-sm text-zinc-400">Так те же данные выглядят на сайте после нормализации. Нажмите на карточку — откроется страница фильма.</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
                {movies.slice(0, 10).map((m) => (
                  <MovieCard key={m.key} movie={m} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}

          {!loading && result && tab === "model" && movies && first !== undefined && (
            <div className="api-code-in grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Сырой элемент · {ep.provider}</p>
                <JsonView value={first} maxHeight={460} />
              </div>
              <div className="hidden items-center justify-center lg:flex">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold-400">Единая модель · Movie</p>
                <JsonView value={movies[0]} maxHeight={460} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* snippets */}
      <div className="mt-6 rounded-[28px] border border-white/10 bg-ink-800/80 p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="font-display text-base font-semibold text-white">Код для вашего проекта</h3>
          <div className="ml-auto flex gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
            {(
              [
                ["bash", "cURL"],
                ["js", "JavaScript"],
                ["py", "Python"],
              ] as [SnippetLang, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setLang(id)}
                className={cn("rounded-full px-4 py-1.5 text-sm font-bold transition", lang === id ? "bg-gold-400 text-ink-950" : "text-zinc-400 hover:text-white")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <CodeBlock key={`${lang}-${epId}`} code={snippetFor(lang, ep, url)} lang={lang} className="api-code-in" />
        <p className="mt-3 text-xs text-zinc-500">Ключи доступа на экране сокращены, а при копировании подставляется полный код.</p>
      </div>
    </div>
  );
}
