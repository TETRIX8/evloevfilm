import type { CSSProperties } from "react";
import { cn } from "../utils/cn";
import "./loader3d.css";

interface Props {
  label?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  /** Optional poster URLs that appear on the film frames. */
  posters?: (string | null | undefined)[];
  className?: string;
}

const OUTER = 10;
const INNER = 7;

const outer = Array.from({ length: OUTER }, (_, i) => i);
const inner = Array.from({ length: INNER }, (_, i) => i);
const dots = Array.from({ length: 18 }, (_, i) => {
  const angle = i * 2.399963;
  const radius = 34 + ((i * 41) % 150);
  return {
    x: Math.cos(angle) * radius,
    y: ((i * 53) % 190) - 105,
    z: Math.sin(angle) * radius,
    delay: (i % 7) * 0.65,
  };
});

export function Loader3D({ label = "Загружаем кино", hint, size = "lg", posters = [], className }: Props) {
  const pics = posters.filter((p): p is string => Boolean(p));
  const pic = (i: number): CSSProperties | undefined =>
    pics.length ? { backgroundImage: `url(${pics[i % pics.length]})` } : undefined;

  return (
    <div className={cn("l3d", `l3d-${size}`, className)} role="status" aria-live="polite" aria-label={label}>
      <div className="l3d-wrap" aria-hidden="true">
        <div className="l3d-scene">
          <div className="l3d-stage">
            <div className="l3d-floor" />

            <div className="l3d-ring l3d-ring-outer">
              {outer.map((i) => (
                <div
                  key={i}
                  className="l3d-frame"
                  style={{ "--i": i, transform: `rotateY(${(360 / OUTER) * i}deg) translateZ(var(--r))` } as CSSProperties}
                >
                  <span className="l3d-perf l3d-perf-l" />
                  <span className="l3d-perf l3d-perf-r" />
                  <span className="l3d-img" style={pic(i)} />
                </div>
              ))}
            </div>

            <div className="l3d-ring l3d-ring-inner">
              {inner.map((i) => (
                <div
                  key={i}
                  className="l3d-frame"
                  style={{ "--i": i + 3, transform: `rotateY(${(360 / INNER) * i}deg) translateZ(var(--r2))` } as CSSProperties}
                >
                  <span className="l3d-perf l3d-perf-l" />
                  <span className="l3d-perf l3d-perf-r" />
                  <span className="l3d-img" style={pic(i + 4)} />
                </div>
              ))}
            </div>

            <div className="l3d-ring l3d-ring-dots">
              {dots.map((d, i) => (
                <span
                  key={i}
                  className="l3d-dot"
                  style={{ transform: `translate3d(${d.x}px, ${d.y}px, ${d.z}px)`, animationDelay: `${d.delay}s` }}
                />
              ))}
            </div>

            <div className="l3d-orb">
              <svg viewBox="0 0 24 24">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <p className="l3d-label">{label}</p>
      {hint && <p className="l3d-hint">{hint}</p>}
      <div className="l3d-bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
