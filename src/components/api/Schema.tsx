import { useState } from "react";
import { ArrowDown, Database, SearchCheck } from "lucide-react";
import { PROVIDERS } from "../../lib/providers/registry";
import { cn } from "../../utils/cn";
import { CodeBlock, PROVIDER_COLOR, Reveal } from "./common";

interface Field {
  field: string;
  type: string;
  tetrix: string | null;
  evloev: string | null;
  kodik: string | null;
}

const FIELDS: Field[] = [
  { field: "title", type: "string", tetrix: "title", evloev: "name", kodik: "title" },
  { field: "originalTitle", type: "string", tetrix: "originalTitle", evloev: "origin_name", kodik: "title_orig" },
  { field: "year", type: "number", tetrix: "year", evloev: "year", kodik: "year" },
  { field: "poster", type: "url", tetrix: "posterUrl", evloev: "poster", kodik: "material_data.poster_url" },
  { field: "player", type: "url", tetrix: "playerUrl", evloev: "iframe_url", kodik: "link" },
  { field: "kp", type: "number", tetrix: "ratings.kinopoisk.rating", evloev: "kinopoisk", kodik: "material_data.kinopoisk_rating" },
  { field: "imdb", type: "number", tetrix: "ratings.imdb.rating", evloev: "imdb", kodik: "material_data.imdb_rating" },
  { field: "genres", type: "string[]", tetrix: "genres[].name", evloev: "genre { id: name }", kodik: "material_data.all_genres" },
  { field: "countries", type: "string[]", tetrix: "countries[].name", evloev: "country { id: name }", kodik: "material_data.countries" },
  { field: "description", type: "string", tetrix: "description", evloev: null, kodik: "material_data.description" },
  { field: "voices", type: "string[]", tetrix: "voiceAuthorsV2[].name", evloev: null, kodik: "translation.title" },
  { field: "seasons", type: "SeasonInfo[]", tetrix: "episodesBySeason (счётчики)", evloev: "seasons[].episodes[]", kodik: "seasons{}.episodes{}" },
  { field: "quality", type: "string", tetrix: null, evloev: "quality", kodik: "quality" },
  { field: "trailer", type: "url", tetrix: null, evloev: "trailer", kodik: null },
];

const MODEL = `interface Movie {
  key: string;              // "tetrix:632" — уникален среди всех API
  provider: "tetrix" | "evloev" | "kodik";
  title: string;
  originalTitle: string;
  year: number | null;
  category: "films" | "serials" | "cartoon" | "anime-serials";
  poster: string | null;
  player: string;           // iframe-ссылка на плеер
  kp: number | null;        // рейтинг Кинопоиска
  imdb: number | null;
  genres: string[];
  countries: string[];
  description: string | null;
  voices: string[];
  seasons: SeasonInfo[] | null;
}`;

const FALLBACK = [
  { title: "Источник отдаёт описание?", text: "Используем его как есть." },
  { title: "Ищем в TetrixFilm по kinopoiskId", text: "Точное совпадение по идентификатору Кинопоиска." },
  { title: "Ищем по названию и году", text: "Нормализуем строки: регистр, знаки, пробелы." },
  { title: "Ничего не нашли", text: "Показываем подсказку и предлагаем сменить источник." },
];

export function Schema() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-ink-800/80">
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gold-400">Поле Movie</th>
                  {PROVIDERS.map((p) => (
                    <th key={p.id} className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: PROVIDER_COLOR[p.id], boxShadow: `0 0 10px ${PROVIDER_COLOR[p.id]}` }} />
                        {p.short}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((f, i) => (
                  <tr
                    key={f.field}
                    onMouseEnter={() => setHover(f.field)}
                    onMouseLeave={() => setHover(null)}
                    className={cn("border-b border-white/5 transition-colors last:border-0", hover === f.field && "bg-gold-400/[0.06]")}
                  >
                    <td className="px-5 py-3.5">
                      <div className="api-row-in flex items-baseline gap-2.5" style={{ animationDelay: `${i * 40}ms` }}>
                        <code className="font-mono text-[13px] font-bold text-gold-200">{f.field}</code>
                        <span className="font-mono text-[11px] text-zinc-600">{f.type}</span>
                      </div>
                    </td>
                    {(["tetrix", "evloev", "kodik"] as const).map((id) => {
                      const v = f[id];
                      return (
                        <td key={id} className="px-5 py-3.5 align-top">
                          {v ? (
                            <code className="font-mono text-xs text-zinc-300">{v}</code>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                              <span className="h-px w-3 bg-zinc-700" /> не отдаёт
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="h-full">
            <div className="mb-3 flex items-center gap-2.5 text-sm font-bold text-white">
              <Database className="h-4 w-4 text-gold-400" /> Единая модель, которую видит интерфейс
            </div>
            <CodeBlock code={MODEL} lang="js" />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="h-full rounded-[28px] border border-white/10 bg-gradient-to-b from-ink-700/60 to-ink-800/90 p-6">
            <div className="mb-5 flex items-center gap-2.5 text-sm font-bold text-white">
              <SearchCheck className="h-4 w-4 text-gold-400" /> Как добираем недостающие данные
            </div>
            <ol className="relative space-y-1">
              {FALLBACK.map((s, i) => (
                <li key={s.title} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < FALLBACK.length - 1 && <span className="absolute left-[15px] top-9 h-[calc(100%-28px)] w-px bg-gradient-to-b from-gold-400/60 to-transparent" />}
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-400/15 font-mono text-sm font-extrabold text-gold-300 ring-1 ring-gold-400/40">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{s.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-400">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-3 text-xs text-zinc-400 ring-1 ring-white/10">
              <ArrowDown className="h-4 w-4 shrink-0 text-gold-400" />
              Поэтому EvloevFilm показывает описания, хотя сам их не отдаёт.
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
