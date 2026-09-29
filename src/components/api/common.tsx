import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { maskSecrets, type HttpMethod } from "../../lib/apiDocs";
import { useInView } from "../../lib/hooks";
import { cn } from "../../utils/cn";

/* ----------------------------------------------------------------- hooks */

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string, id = "default") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else to try */
      }
      area.remove();
    }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
  }, []);
  return { copied, copy };
}

export function useCountUp(target: number, duration = 1300, run = true): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return undefined;
    let raf = 0;
    const from = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - from) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, run]);
  return value;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------ containers */

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, "0px 0px -6% 0px");
  return (
    <div
      ref={ref}
      className={cn("transition-all duration-700 ease-out", seen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0", className)}
      style={{ transitionDelay: seen ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/** Card that leans toward the pointer in 3D and carries a moving light reflection. */
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--glare", "1");
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("relative transition-transform duration-200 ease-out will-change-transform", className)}
      style={{ transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: "var(--glare, 0)",
          background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.11), transparent 60%)",
        }}
      />
    </div>
  );
}

interface SectionProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-44 px-5 py-14 md:py-20 lg:px-8">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-400">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">{subtitle}</p>}
      </Reveal>
      <div className="mt-9 md:mt-12">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------- code view */

export type Lang = "bash" | "js" | "py" | "json";

const TOKENS =
  /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(#[^\n]*|\/\/[^\n]*)|\b(const|let|await|async|import|from|if|throw|new|return|print|for|in|curl|jq|requests|console|fetch|true|false|null|None|True|False|interface|string|number|boolean|export)\b|(-?\b\d+(?:\.\d+)?\b)/g;

export function highlight(code: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKENS)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(code.slice(last, idx));
    const text = m[0];
    let cls: string;
    if (m[1]) {
      const isKey = lang === "json" && /^\s*:/.test(code.slice(idx + text.length, idx + text.length + 4));
      cls = isKey ? "text-sky-300" : "text-emerald-300";
    } else if (m[2]) cls = "text-zinc-500 italic";
    else if (m[3]) cls = "text-fuchsia-300";
    else cls = "text-amber-300";
    out.push(
      <span key={i++} className={cls}>
        {text}
      </span>,
    );
    last = idx + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CopyButton({ copied, onClick, label = "Копировать" }: { copied: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ring-1 transition",
        copied ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" : "bg-white/[0.07] text-zinc-300 ring-white/10 hover:bg-white/15 hover:text-white",
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Скопировано" : label}
    </button>
  );
}

export function CodeBlock({ code, lang, className, maxHeight }: { code: string; lang: Lang; className?: string; maxHeight?: number }) {
  const { copied, copy } = useCopy();
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950/80", className)}>
      <div className="absolute right-2.5 top-2.5 z-10">
        <CopyButton copied={copied === "code"} onClick={() => void copy(code, "code")} />
      </div>
      <pre className="overflow-auto p-4 pr-28 font-mono text-[12.5px] leading-relaxed text-zinc-200" style={maxHeight ? { maxHeight } : undefined}>
        <code>{highlight(maskSecrets(code), lang)}</code>
      </pre>
    </div>
  );
}

const METHOD_STYLE: Record<HttpMethod, string> = {
  GET: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  POST: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  PUT: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
};

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-md px-2 py-1 font-mono text-[11px] font-extrabold tracking-wider ring-1", METHOD_STYLE[method], className)}>
      {method}
    </span>
  );
}

export const PROVIDER_COLOR = {
  tetrix: "#ffbb55",
  evloev: "#7dd3fc",
  kodik: "#d8b4fe",
} as const;
