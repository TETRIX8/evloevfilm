import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Database } from "lucide-react";
import type { Movie } from "../lib/api";
import { useProvider } from "../lib/provider-context";
import { navigate } from "../lib/router";
import { cn } from "../utils/cn";
import { ApiHero } from "./api/ApiHero";
import { Reveal, Section } from "./api/common";
import { useHealth } from "./api/health";
import { Pipeline } from "./api/Pipeline";
import { Playground, type PlaygroundRequest } from "./api/Playground";
import { Reference } from "./api/Reference";
import { Schema } from "./api/Schema";
import { StatusBoard } from "./api/StatusBoard";
import { TestSuite } from "./api/TestSuite";
import "./api/api.css";

interface Props {
  onOpen: (movie: Movie, play?: boolean) => void;
}

const NAV = [
  { id: "overview", label: "Обзор" },
  { id: "status", label: "Статус" },
  { id: "flow", label: "Как работает" },
  { id: "playground", label: "Тестер" },
  { id: "tests", label: "Автотесты" },
  { id: "schema", label: "Модель данных" },
  { id: "reference", label: "Справочник" },
];

const DEFAULT_TITLE = "EVOLVEFILM — фильмы, сериалы и аниме онлайн";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = "";
        let ratio = 0;
        seen.forEach((v, k) => {
          if (v > ratio) {
            ratio = v;
            best = k;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.1, 0.3, 0.6, 1] },
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-[108px] z-40 border-y border-white/5 bg-ink-950/75 backdrop-blur-xl md:top-[72px]">
      <nav aria-label="Разделы API" className="no-scrollbar mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 py-2.5 lg:px-8">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => scrollToId(n.id)}
            aria-current={active === n.id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              active === n.id ? "bg-gold-400 text-ink-950 shadow-lg" : "text-zinc-400 hover:bg-white/10 hover:text-white",
            )}
          >
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function ApiPage({ onOpen }: Props) {
  const { health, refresh } = useHealth();
  const { provider, openDialog } = useProvider();
  const [request, setRequest] = useState<PlaygroundRequest | null>(null);
  const [runNonce, setRunNonce] = useState(0);

  useEffect(() => {
    document.title = "API и тесты — EVOLVEFILM";
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const tryIt = useCallback((epId: string, values?: Record<string, string>) => {
    setRequest({ nonce: Date.now(), epId, values });
    scrollToId("playground");
  }, []);

  const runTests = useCallback(() => {
    setRunNonce((n) => n + 1);
    scrollToId("tests");
  }, []);

  return (
    <div>
      <ApiHero health={health} onPlayground={() => scrollToId("playground")} onTests={runTests} />
      <SectionNav />

      <Section
        id="status"
        eyebrow="01 · Живой статус"
        title="Три источника — и все под наблюдением"
        subtitle="Мы сами отправляем запросы из вашего браузера и показываем реальное время ответа. Так видно, какой API сейчас быстрее."
      >
        <StatusBoard health={health} onRefresh={refresh} onTry={(id) => tryIt(id)} />
      </Section>

      <Section
        id="flow"
        eyebrow="02 · Как это работает"
        title="Путь одного запроса — от клика до карточки"
        subtitle="Интерфейс не знает, откуда пришли данные. Адаптер говорит с нужным API, а нормализатор приводит ответ к единой модели."
      >
        <Pipeline />
      </Section>

      <Section
        id="playground"
        eyebrow="03 · Интерактивный тестер"
        title="Отправьте настоящий запрос и посмотрите на ответ"
        subtitle="Меняйте параметры, смотрите сырой JSON, готовые карточки и то, как данные превращаются в единую модель. Здесь же — код для вашего проекта."
      >
        <Playground request={request} onOpen={onOpen} />
      </Section>

      <Section
        id="tests"
        eyebrow="04 · Автоматические тесты"
        title="Проверяем каждый метод каждого API"
        subtitle="Тесты обращаются к живым серверам: каталог, поиск, фильтры, пагинация, описания и плеер. Зелёный — работает, жёлтый — есть замечание, красный — сломано."
      >
        <TestSuite runNonce={runNonce} />
      </Section>

      <Section
        id="schema"
        eyebrow="05 · Единая модель данных"
        title="Разные ответы — один понятный формат"
        subtitle="У каждого API свои названия полей. Таблица показывает, откуда берётся каждое значение и чего источник не отдаёт."
      >
        <Schema />
      </Section>

      <Section
        id="reference"
        eyebrow="06 · Справочник"
        title="Все методы, параметры и примеры"
        subtitle="Раскройте метод, чтобы увидеть параметры и готовый запрос. Кнопка «Открыть в тестере» выполнит его прямо на этой странице."
      >
        <Reference onTry={(id) => tryIt(id)} />
      </Section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <Reveal>
          <div className="grain relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-gold-500/25 via-ink-800 to-ink-900 p-8 md:p-14">
            <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-gold-500/25 blur-[100px]" />
            <div className="absolute -bottom-24 left-10 -z-10 h-64 w-64 rounded-full bg-violet-500/15 blur-[100px]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Всё готово</p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              Теперь вы знаете, как <span className="gold-text">работает каждый API</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
              Сейчас сайт использует «{provider.name}». Смените источник в любой момент — каталог, поиск и плеер перестроятся автоматически.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate({ name: "home" })} className="btn-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-extrabold">
                <ArrowLeft className="h-5 w-5" /> К каталогу
              </button>
              <button type="button" onClick={openDialog} className="glass inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/15">
                <Database className="h-5 w-5 text-gold-300" /> Сменить источник
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
