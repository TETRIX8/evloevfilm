import { useState } from "react";
import { ChevronDown, FlaskConical, KeyRound, Layers, Link2, Lock, Info } from "lucide-react";
import { buildUrl, defaultValues, docParamsOf, ENDPOINTS, PROVIDER_INFO, snippetFor, type EndpointDef } from "../../lib/apiDocs";
import { PROVIDERS } from "../../lib/providers/registry";
import type { ProviderId } from "../../lib/types";
import { cn } from "../../utils/cn";
import { CodeBlock, CopyButton, MethodBadge, PROVIDER_COLOR, Reveal, useCopy } from "./common";

interface Props {
  onTry: (epId: string) => void;
}

function EndpointCard({ ep, open, onToggle, onTry }: { ep: EndpointDef; open: boolean; onToggle: () => void; onTry: () => void }) {
  const params = docParamsOf(ep);
  const curl = ep.example ?? snippetFor("bash", ep, buildUrl(ep, defaultValues(ep)));

  return (
    <div className={cn("overflow-hidden rounded-2xl border transition-colors duration-300", open ? "border-gold-400/30 bg-white/[0.04]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-4 text-left md:px-5">
        <MethodBadge method={ep.method} />
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] font-bold text-white">{ep.path}</code>
        <span className="hidden text-sm text-zinc-400 md:block">{ep.title}</span>
        {!ep.tryable && (
          <span className="hidden items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 sm:inline-flex">
            <Lock className="h-3 w-3" /> только чтение
          </span>
        )}
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-300", open && "rotate-180 text-gold-300")} />
      </button>

      <div className={cn("grid transition-[grid-template-rows] duration-500 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="space-y-5 px-4 pb-5 md:px-5">
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">{ep.summary}</p>

            {params.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="no-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-[13px]">
                    <thead>
                      <tr className="bg-white/[0.04] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="px-4 py-2.5">Параметр</th>
                        <th className="px-4 py-2.5">Тип</th>
                        <th className="px-4 py-2.5">Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      {params.map((p) => (
                        <tr key={p.name} className="border-t border-white/5">
                          <td className="whitespace-nowrap px-4 py-2.5 align-top">
                            <code className="font-mono font-bold text-gold-200">{p.name}</code>
                            {p.required && <span className="ml-1.5 text-[10px] font-bold text-rose-300">обяз.</span>}
                          </td>
                          <td className="px-4 py-2.5 align-top font-mono text-xs text-zinc-500">{p.type}</td>
                          <td className="px-4 py-2.5 align-top text-zinc-300">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <CodeBlock code={curl} lang="bash" />

            {ep.tryable && (
              <button type="button" onClick={onTry} className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold">
                <FlaskConical className="h-4 w-4" /> Открыть в тестере
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Reference({ onTry }: Props) {
  const [pid, setPid] = useState<ProviderId>("tetrix");
  const [openId, setOpenId] = useState<string | null>("tetrix-catalog");
  const { copied, copy } = useCopy();
  const info = PROVIDER_INFO[pid];
  const eps = ENDPOINTS.filter((e) => e.provider === pid);

  const select = (id: ProviderId) => {
    setPid(id);
    setOpenId(ENDPOINTS.find((e) => e.provider === id)?.id ?? null);
  };

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex flex-wrap gap-2.5">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => select(p.id)}
              aria-pressed={pid === p.id}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-bold ring-1 transition",
                pid === p.id ? "bg-white text-ink-950 ring-white shadow-lg" : "bg-white/[0.05] text-zinc-300 ring-white/10 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR[p.id] }} />
              {p.name}
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold", pid === p.id ? "bg-ink-950/10" : "bg-white/10")}>{ENDPOINTS.filter((e) => e.provider === p.id).length}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
        <Reveal>
          <aside key={pid} className="api-code-in space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-ink-700/60 to-ink-800/90 p-5 lg:sticky lg:top-40">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <Link2 className="h-3.5 w-3.5" /> Базовый адрес
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-ink-950/70 p-2 pl-3 ring-1 ring-white/10">
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-gold-200">{info.base}</code>
                <CopyButton copied={copied === "base"} onClick={() => void copy(info.base, "base")} label="" />
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 text-zinc-300">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                {info.auth}
              </div>
              <div className="flex gap-3 text-zinc-300">
                <Layers className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                {info.pagination}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <Info className="h-3.5 w-3.5" /> Хорошо знать
              </p>
              <ul className="space-y-2.5">
                {info.notes.map((n) => (
                  <li key={n} className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-400">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-400" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>

        <div key={`list-${pid}`} className="api-code-in space-y-3">
          {eps.map((e) => (
            <EndpointCard key={e.id} ep={e} open={openId === e.id} onToggle={() => setOpenId((cur) => (cur === e.id ? null : e.id))} onTry={() => onTry(e.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
