import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { maskSecrets } from "../../lib/apiDocs";
import { cn } from "../../utils/cn";

const STEP = 16;
const PAGE = 20;

function Primitive({ value }: { value: unknown }) {
  if (value === null) return <span className="text-zinc-500">null</span>;
  if (typeof value === "string") {
    const text = maskSecrets(value);
    const cut = text.length > 96 ? `${text.slice(0, 94)}…` : text;
    return (
      <span className="break-all text-emerald-300" title={text.length > 96 ? text : undefined}>
        {JSON.stringify(cut)}
      </span>
    );
  }
  if (typeof value === "number") return <span className="text-amber-300">{String(value)}</span>;
  if (typeof value === "boolean") return <span className="text-fuchsia-300">{String(value)}</span>;
  return <span className="text-zinc-400">{String(value)}</span>;
}

function Key({ name }: { name?: string }) {
  if (name === undefined) return null;
  return (
    <>
      <span className="text-sky-300">{JSON.stringify(name)}</span>
      <span className="text-zinc-500">: </span>
    </>
  );
}

interface NodeProps {
  name?: string;
  value: unknown;
  depth: number;
  comma: boolean;
  openDepth: number;
}

function Node({ name, value, depth, comma, openDepth }: NodeProps) {
  const [open, setOpen] = useState(depth < openDepth);
  const [all, setAll] = useState(false);
  const pad = { paddingLeft: depth * STEP };
  const sep = comma ? <span className="text-zinc-500">,</span> : null;

  if (value === null || typeof value !== "object") {
    return (
      <div style={pad} className="whitespace-pre-wrap">
        <Key name={name} />
        <Primitive value={value} />
        {sep}
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries: [string, unknown][] = isArray ? (value as unknown[]).map((v, i) => [String(i), v]) : Object.entries(value as Record<string, unknown>);
  const [o, c] = isArray ? ["[", "]"] : ["{", "}"];

  if (entries.length === 0) {
    return (
      <div style={pad}>
        <Key name={name} />
        <span className="text-zinc-400">
          {o}
          {c}
        </span>
        {sep}
      </div>
    );
  }

  if (!open) {
    return (
      <div style={pad}>
        <button type="button" onClick={() => setOpen(true)} className="group -ml-4 inline-flex items-center gap-1 text-left">
          <ChevronRight className="h-3 w-3 text-zinc-500 transition group-hover:text-gold-300" />
          <Key name={name} />
          <span className="text-zinc-400">{o}</span>
          <span className="rounded bg-white/[0.07] px-1.5 text-[11px] text-zinc-400 group-hover:text-white">
            {entries.length} {isArray ? "эл." : "полей"}
          </span>
          <span className="text-zinc-400">{c}</span>
        </button>
        {sep}
      </div>
    );
  }

  const shown = all ? entries : entries.slice(0, PAGE);
  return (
    <div>
      <div style={pad}>
        <button type="button" onClick={() => setOpen(false)} className="group -ml-4 inline-flex items-center gap-1 text-left">
          <ChevronRight className="h-3 w-3 rotate-90 text-zinc-500 transition group-hover:text-gold-300" />
          <Key name={name} />
          <span className="text-zinc-400">{o}</span>
        </button>
      </div>
      {shown.map(([k, v], i) => (
        <Node key={k} name={isArray ? undefined : k} value={v} depth={depth + 1} comma={i < entries.length - 1} openDepth={openDepth} />
      ))}
      {!all && entries.length > PAGE && (
        <div style={{ paddingLeft: (depth + 1) * STEP }}>
          <button type="button" onClick={() => setAll(true)} className="rounded bg-white/[0.07] px-2 py-0.5 text-[11px] font-semibold text-gold-300 hover:bg-white/15">
            … показать ещё {entries.length - PAGE}
          </button>
        </div>
      )}
      <div style={pad}>
        <span className="text-zinc-400">{c}</span>
        {sep}
      </div>
    </div>
  );
}

export function JsonView({ value, className, maxHeight = 520 }: { value: unknown; className?: string; maxHeight?: number }) {
  const [openDepth, setOpenDepth] = useState(3);
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950/80", className)}>
      <div className="flex items-center justify-end gap-1.5 border-b border-white/5 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpenDepth(99)}
          className="rounded-md px-2 py-1 text-[11px] font-bold text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          Развернуть всё
        </button>
        <button
          type="button"
          onClick={() => setOpenDepth(1)}
          className="rounded-md px-2 py-1 text-[11px] font-bold text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          Свернуть
        </button>
      </div>
      <div className="overflow-auto p-4 pl-6 font-mono text-[12.5px] leading-[1.7] text-zinc-200" style={{ maxHeight }}>
        <Node key={openDepth} value={value} depth={0} comma={false} openDepth={openDepth} />
      </div>
    </div>
  );
}
