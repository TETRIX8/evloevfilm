import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { Movie } from "../lib/api";
import { MovieCard } from "./MovieCard";
import { CardSkeleton, ErrorState, SectionHeading } from "./ui";
import { cn } from "../utils/cn";

interface RowProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  items: Movie[] | null;
  error?: boolean;
  onRetry?: () => void;
  onOpen: (movie: Movie) => void;
  onMore?: () => void;
  ranked?: boolean;
}

const CARD_W = "w-[138px] sm:w-[160px] md:w-[184px] lg:w-[200px]";

export function Row({ title, subtitle, icon, items, error, onRetry, onOpen, onMore, ranked }: RowProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, items]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8">
      <SectionHeading icon={icon} title={title} subtitle={subtitle} onAction={onMore} />

      {error ? (
        <ErrorState compact onRetry={onRetry ?? (() => undefined)} />
      ) : (
        <div className="group/row relative -mx-5 lg:-mx-8">
          <div
            ref={scroller}
            className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto scroll-smooth px-5 pb-4 pt-2 lg:px-8"
          >
            {items === null
              ? Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} className={CARD_W} />)
              : items.map((m, i) =>
                  ranked ? (
                    <div key={m.key} className="group relative flex shrink-0 snap-start items-end">
                      <span
                        aria-hidden="true"
                        className="text-stroke -mr-4 select-none pb-8 font-display text-[92px] font-extrabold leading-none tracking-tighter md:-mr-5 md:text-[128px]"
                      >
                        {i + 1}
                      </span>
                      <MovieCard movie={m} onOpen={onOpen} className={cn("relative", CARD_W)} />
                    </div>
                  ) : (
                    <MovieCard key={m.key} movie={m} onOpen={onOpen} className={cn("snap-start shrink-0", CARD_W)} />
                  ),
                )}
          </div>

          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-ink-950 to-transparent transition-opacity md:block",
              canLeft ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-ink-950 to-transparent transition-opacity md:block",
              canRight ? "opacity-100" : "opacity-0",
            )}
          />

          {canLeft && (
            <button
              type="button"
              aria-label="Прокрутить назад"
              onClick={() => scrollBy(-1)}
              className="glass absolute left-3 top-[38%] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white opacity-0 shadow-xl transition hover:bg-gold-400 hover:text-ink-950 group-hover/row:opacity-100 md:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canRight && (
            <button
              type="button"
              aria-label="Прокрутить вперёд"
              onClick={() => scrollBy(1)}
              className="glass absolute right-3 top-[38%] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white opacity-0 shadow-xl transition hover:bg-gold-400 hover:text-ink-950 group-hover/row:opacity-100 md:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
