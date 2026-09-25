import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, RotateCcw, Sparkles, Move } from "lucide-react";
import { MovieData } from "@/services/api";
import { cn } from "@/lib/utils";

interface MovieSphereProps {
  movies: MovieData[];
  title?: string;
  subtitle?: string;
  className?: string;
}

interface SphereCard {
  movie: MovieData;
  x: number;
  y: number;
  z: number;
  lat: number;
  lon: number;
  idx: number;
}

export function MovieSphere({
  movies,
  title = "EVLOEVFILM",
  subtitle = "Вращайте сферическую коллекцию фильмов",
  className,
}: MovieSphereProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [hoveredMovie, setHoveredMovie] = useState<MovieData | null>(null);

  // Filter movies with valid posters
  const displayMovies = useMemo(() => {
    return movies.filter((m) => m.poster && m.title).slice(0, 24);
  }, [movies]);

  // Compute 3D Fibonacci sphere positions
  const sphereCards = useMemo<SphereCard[]>(() => {
    const count = displayMovies.length;
    if (count === 0) return [];
    const GA = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

    return displayMovies.map((movie, i) => {
      const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * GA;

      const x = Math.cos(theta) * rad;
      const z = Math.sin(theta) * rad;

      const lat = (Math.asin(y) * 180) / Math.PI;
      const lon = (Math.atan2(x, z) * 180) / Math.PI;

      return {
        movie,
        x,
        y,
        z,
        lat,
        lon,
        idx: i,
      };
    });
  }, [displayMovies]);

  // Physics & Animation state
  const stateRef = useRef({
    spin: 0,
    tilt: -6,
    dragX: 0,
    dragY: 0,
    velX: 0.15,
    velY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    radius: 280,
  });

  // Calculate radius based on container/viewport
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const minDim = Math.min(w, h);
      stateRef.current.radius = Math.max(160, Math.min(380, minDim * 0.38));
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Main 3D render loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const st = stateRef.current;

      // Auto-rotation when not dragging
      if (!st.isDragging) {
        if (isAutoRotate) {
          st.dragX += st.velX;
        } else {
          st.dragX += st.velX;
          st.velX *= 0.95;
          st.velY *= 0.95;
          if (Math.abs(st.velX) < 0.001) st.velX = 0;
          if (Math.abs(st.velY) < 0.001) st.velY = 0;
        }
      }

      // Clamp tilt
      const sx = Math.max(-35, Math.min(35, st.tilt + st.dragY));
      const sy = st.spin + st.dragX;

      if (worldRef.current) {
        worldRef.current.style.transform = `rotateY(${sy}deg) rotateX(${sx}deg)`;
      }

      // Keep center title square to camera at sphere origin
      if (headlineRef.current) {
        const R = st.radius;
        headlineRef.current.style.transform = `rotateX(${-sx}deg) rotateY(${-sy}deg) translateZ(${R * 0.55}px)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotate]);

  // Pointer event handlers for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    const st = stateRef.current;
    st.isDragging = true;
    st.startX = e.clientX;
    st.startY = e.clientY;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.velX = 0;
    st.velY = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const st = stateRef.current;
    if (!st.isDragging) return;

    const dx = e.clientX - st.lastX;
    const dy = e.clientY - st.lastY;

    st.dragX += dx * 0.35;
    st.dragY -= dy * 0.25;

    st.velX = dx * 0.2;
    st.velY = -dy * 0.15;

    st.lastX = e.clientX;
    st.lastY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const st = stateRef.current;
    st.isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleReset = () => {
    const st = stateRef.current;
    st.dragX = 0;
    st.dragY = 0;
    st.velX = 0.2;
    st.velY = 0;
  };

  const R = stateRef.current.radius || 280;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-[#07090e] p-4 sm:p-8", className)}>
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,174,75,0.08),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Header controls */}
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> 3D Коллекция
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{subtitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition",
              isAutoRotate
                ? "border-primary/50 bg-primary/20 text-primary"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            )}
          >
            <RotateCcw className={cn("h-3.5 w-3.5", isAutoRotate && "animate-spin")} />
            {isAutoRotate ? "Автовращение: Вкл" : "Пауза"}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            Сброс вида
          </button>
        </div>
      </div>

      {/* 3D Stage Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative min-h-[460px] w-full cursor-grab active:cursor-grabbing select-none sm:min-h-[580px]"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Drag Hint Overlay */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md">
          <Move className="h-3.5 w-3.5 text-primary animate-pulse" />
          Зажмите и тяните для вращения сферы
        </div>

        {/* 3D World Origin */}
        <div
          ref={worldRef}
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Centered Headline inside 3D space */}
          <div
            ref={headlineRef}
            className="pointer-events-none absolute left-0 top-0 w-[280px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[360px]"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <span className="font-display text-2xl font-black tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] sm:text-4xl">
              {title}
            </span>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary/90 sm:text-sm">
              Интерактивный каталог
            </p>
          </div>

          {/* 3D Movie Cards */}
          {sphereCards.map(({ movie, x, y, z, lat, lon, idx }) => {
            const tx = x * R;
            const ty = -y * R;
            const tz = z * R;

            return (
              <div
                key={`${movie.id || movie.title}-${idx}`}
                onClick={() => navigate(`/movie/${encodeURIComponent(movie.title)}`)}
                onMouseEnter={() => setHoveredMovie(movie)}
                onMouseLeave={() => setHoveredMovie(null)}
                className="group absolute left-0 top-0 cursor-pointer transition-transform duration-300 hover:scale-125"
                style={{
                  width: "110px",
                  height: "160px",
                  marginLeft: "-55px",
                  marginTop: "-80px",
                  transformStyle: "preserve-3d",
                  transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${lon}deg) rotateX(${lat}deg)`,
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/15 bg-slate-900 shadow-2xl transition duration-300 group-hover:border-primary group-hover:shadow-[0_0_25px_rgba(255,174,75,0.4)]">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95" />

                  {/* Rating badge */}
                  {movie.rating && (
                    <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-amber-400" />
                      {movie.rating}
                    </div>
                  )}

                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Title footer */}
                  <div className="absolute bottom-0 inset-x-0 p-2 text-left">
                    <p className="line-clamp-1 text-[11px] font-bold leading-tight text-white">
                      {movie.title}
                    </p>
                    {movie.year && (
                      <p className="text-[9px] font-medium text-slate-400">{movie.year}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hovered Movie Preview Bar */}
      {hoveredMovie && (
        <div className="relative z-20 mt-4 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {hoveredMovie.poster && (
              <img
                src={hoveredMovie.poster}
                alt={hoveredMovie.title}
                className="h-12 w-9 rounded-lg object-cover shadow"
              />
            )}
            <div>
              <p className="font-extrabold text-white text-sm sm:text-base">{hoveredMovie.title}</p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                {hoveredMovie.year && <span>{hoveredMovie.year}</span>}
                {hoveredMovie.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="h-3 w-3 fill-amber-400" /> {hoveredMovie.rating}
                  </span>
                )}
                {hoveredMovie.genre && <span className="text-slate-400">• {hoveredMovie.genre}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/movie/${encodeURIComponent(hoveredMovie.title)}`)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow transition hover:bg-primary/90"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Смотреть
          </button>
        </div>
      )}
    </div>
  );
}
