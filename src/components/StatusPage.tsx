import { useEffect, useMemo, useState } from "react";
import { Activity, Eye, MousePointerClick, Radio, RefreshCw, Users, Wifi } from "lucide-react";
import { loadSiteStats, type SiteStats, type StatDay } from "../lib/stats";
import { setSiteSeo } from "../lib/seo";

const EMPTY: SiteStats = {
  visits: 0,
  users: 0,
  clicks: 0,
  activeUsers: 0,
  togetherViewers: 0,
  togetherRooms: 0,
  history: [],
  updatedAt: new Date().toISOString(),
};

const format = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

function Metric({ icon: Icon, label, value, accent, note }: { icon: typeof Eye; label: string; value: number; accent: string; note: string }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-gold-400/30">
      <div className={`absolute -right-8 -top-10 h-36 w-36 rounded-full blur-3xl opacity-20 ${accent}`} />
      <div className="relative flex items-start justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.09] ring-1 ring-white/10">
          <Icon className="h-5 w-5 text-gold-300" />
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">live</span>
      </div>
      <p className="relative mt-8 text-sm font-semibold text-zinc-400">{label}</p>
      <p className="relative mt-1 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">{format(value)}</p>
      <p className="relative mt-3 text-xs text-zinc-500">{note}</p>
    </article>
  );
}

function MonthChart({ history, live }: { history: StatDay[]; live: boolean }) {
  const chart = useMemo(() => {
    const days = history.length ? history : Array.from({ length: 30 }, (_, i) => ({ date: `day-${i}`, visits: 0, clicks: 0 }));
    const max = Math.max(1, ...days.flatMap((d) => [d.visits, d.clicks]));
    const x = (i: number) => days.length === 1 ? 300 : (i / (days.length - 1)) * 600;
    const y = (value: number) => 176 - (value / max) * 142;
    const visits = days.map((d, i) => `${x(i)},${y(d.visits)}`).join(" ");
    const clicks = days.map((d, i) => `${x(i)},${y(d.clicks)}`).join(" ");
    const area = `M0,176 L${days.map((d, i) => `${x(i)},${y(d.visits)}`).join(" L")} L600,176 Z`;
    return { days, max, visits, clicks, area };
  }, [history]);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/20 px-3 pb-3 pt-4 ring-1 ring-white/5">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500"><span>Переходы и клики</span><span>макс. {format(chart.max)}</span></div>
      <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="h-48 w-full">
        <defs>
          <linearGradient id="status-line" x1="0" x2="1">
            <stop stopColor="#ffd08a" />
            <stop offset="1" stopColor="#ff7a4d" />
          </linearGradient>
          <linearGradient id="status-fill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#ffbb55" stopOpacity=".3" />
            <stop offset="1" stopColor="#ffbb55" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[34, 81, 128, 176].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(255,255,255,.08)" strokeDasharray="4 8" />)}
        <path d={chart.area} fill="url(#status-fill)" />
        <polyline points={chart.visits} fill="none" stroke="url(#status-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={chart.clicks} fill="none" stroke="#8b7dff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 0" />
      </svg>
      <div className="mt-2 grid grid-cols-6 text-[10px] text-zinc-600">{chart.days.filter((_, i) => i % 5 === 0 || i === chart.days.length - 1).map((d) => <span key={d.date}>{new Date(`${d.date}T12:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}</span>)}</div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400"><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-gold-300" /> Переходы</span><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400" /> Клики</span>{live && <span className="ml-auto inline-flex items-center gap-1.5 font-bold uppercase tracking-widest text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> онлайн</span>}</div>
    </div>
  );
}

export function StatusPage() {
  const [stats, setStats] = useState<SiteStats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSiteSeo({
      title: "Статистика TetrixFilm — онлайн",
      description: "Живая статистика TetrixFilm: переходы, пользователи, клики и зрители совместных просмотров.",
      canonical: "https://tetrixfilm.ru/status",
    });
    let cancelled = false;
    const refresh = () => loadSiteStats().then((next) => { if (!cancelled) { setStats(next); setError(false); setLoading(false); } }).catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const updated = new Date(stats.updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-5 pb-24 pt-32 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 -z-10 h-96 w-96 rounded-full bg-gold-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-64 -z-10 h-[32rem] w-[32rem] rounded-full bg-violet-500/10 blur-[140px]" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><Activity className="h-3.5 w-3.5" /> live dashboard</div>
            <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">TetrixFilm <span className="text-gold-300">в цифрах</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">Живая панель активности платформы — без лишнего шума, только реальные движения сайта и совместных просмотров.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"><Wifi className="h-3.5 w-3.5 text-emerald-300" /> обновлено в {updated}</span><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-gold-300" : "text-zinc-600"}`} /></div>
        </div>

        {error && <div className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">Статистика временно обновляется. Попробуйте обновить страницу через несколько секунд.</div>}

        <section className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Eye} label="Переходы" value={stats.visits} accent="bg-gold-400" note="загрузок страниц за всё время" />
          <Metric icon={Users} label="Пользователи" value={stats.users} accent="bg-violet-400" note="уникальных анонимных посетителей" />
          <Metric icon={MousePointerClick} label="Клики" value={stats.clicks} accent="bg-sky-400" note="нажатий по элементам сайта" />
          <Metric icon={Radio} label="Смотрят вместе" value={stats.togetherViewers} accent="bg-emerald-400" note={`${format(stats.togetherRooms)} активных комнат прямо сейчас`} />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold text-white">Пульс платформы</p><p className="mt-1 text-xs text-zinc-500">Полный период: последние 30 дней</p></div><span className="rounded-full bg-gold-400/10 px-3 py-1.5 text-xs font-semibold text-gold-300">месяц</span></div>
            <MonthChart history={stats.history} live={!error} />
            <div className="mt-5 flex flex-wrap gap-3"><span className="rounded-xl bg-white/[0.05] px-3 py-2 text-xs text-zinc-400">Активны на сайте: <b className="text-white">{format(stats.activeUsers)}</b></span><span className="rounded-xl bg-white/[0.05] px-3 py-2 text-xs text-zinc-400">В комнатах: <b className="text-white">{format(stats.togetherRooms)}</b></span><span className="rounded-xl bg-white/[0.05] px-3 py-2 text-xs text-zinc-400">Обновление: <b className="text-white">15 сек</b></span></div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-gold-400/20 bg-gradient-to-br from-gold-400/15 via-white/[0.045] to-violet-400/10 p-6 sm:p-8"><div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-gold-300/20" /><div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-gold-300/20" /><div className="relative"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-400 text-ink-950"><Radio className="h-6 w-6" /></div><p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Together mode</p><h2 className="mt-3 font-display text-2xl font-bold text-white">Смотрим рядом,<br />даже если далеко</h2><p className="mt-4 text-sm leading-relaxed text-zinc-400">Комнаты синхронизируют плеер, чат и голосовую связь для общей киноночки.</p><a href="https://tetrixfilm.duckdns.org/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-ink-950 transition hover:-translate-y-0.5 hover:bg-gold-200">Открыть комнаты <Activity className="h-4 w-4" /></a></div></div>
        </section>
      </div>
    </div>
  );
}
