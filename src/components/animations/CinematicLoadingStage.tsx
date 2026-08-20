import { motion } from "framer-motion";
import { Clapperboard, Film, Play, Sparkles } from "lucide-react";

export type LoadingVariant = "snowflake" | "default" | "globe" | "minimal" | "pulse" | "cascade" | "glitch";

interface CinematicLoadingStageProps {
  variant: string;
  compact?: boolean;
}

const loadingPresets: Record<LoadingVariant, { label: string; caption: string; accent: string; accentSoft: string }> = {
  snowflake: {
    label: "Свет на плёнке",
    caption: "Проектор уже запускается",
    accent: "#e7bd72",
    accentSoft: "#f7ead4",
  },
  default: {
    label: "Зрительный зал готов",
    caption: "Открываем историю на большом экране",
    accent: "#e7bd72",
    accentSoft: "#f9d889",
  },
  globe: {
    label: "Кадр за кадром",
    caption: "Собираем ваш сеанс",
    accent: "#8eb9ff",
    accentSoft: "#d6e5ff",
  },
  minimal: {
    label: "EvloevFilm",
    caption: "Загрузка",
    accent: "#e7bd72",
    accentSoft: "#ffffff",
  },
  pulse: {
    label: "Пульс истории",
    caption: "Экран оживает",
    accent: "#f28170",
    accentSoft: "#ffd0c8",
  },
  cascade: {
    label: "Сцена оживает",
    caption: "Свет. Камера. Впечатления.",
    accent: "#caaa7a",
    accentSoft: "#f4e6d0",
  },
  glitch: {
    label: "Лента в движении",
    caption: "Синхронизируем изображение",
    accent: "#d46b71",
    accentSoft: "#f8c1c7",
  },
};

function getPreset(variant: string) {
  return loadingPresets[variant as LoadingVariant] ?? loadingPresets.default;
}

export function CinematicLoadingStage({ variant, compact = false }: CinematicLoadingStageProps) {
  const preset = getPreset(variant);
  const iconSize = compact ? "h-7 w-7" : "h-11 w-11 md:h-14 md:w-14";
  const titleSize = compact ? "text-base" : "text-2xl md:text-4xl";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070914] text-[#f8f1e7] ${compact ? "min-h-[12rem]" : "min-h-screen"}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 42%, rgba(231, 189, 114, 0.12), transparent 24rem), linear-gradient(135deg, #060812 0%, #101221 48%, #080914 100%)",
      }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[18%] opacity-50"
        animate={{ opacity: [0.26, 0.48, 0.26], x: [-8, 8, -8] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(90deg, rgba(231,189,114,0.10), rgba(231,189,114,0.025) 40%, transparent)",
          clipPath: "polygon(0 0, 100% 30%, 100% 70%, 0 100%)",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[18%] opacity-50"
        animate={{ opacity: [0.26, 0.48, 0.26], x: [8, -8, 8] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(270deg, rgba(231,189,114,0.10), rgba(231,189,114,0.025) 40%, transparent)",
          clipPath: "polygon(0 0, 100% 30%, 100% 70%, 0 100%)",
        }}
      />

      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-4 border-y border-white/[0.05] bg-black/35">
        <div className="h-full w-full opacity-40" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.26) 14px 20px, transparent 20px 34px)" }} />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 border-y border-white/[0.05] bg-black/35">
        <div className="h-full w-full opacity-40" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.26) 14px 20px, transparent 20px 34px)" }} />
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute h-[43%] w-[56%] rounded-[50%] blur-3xl"
        animate={{ opacity: [0.12, 0.34, 0.12], scale: [0.92, 1.04, 0.92] }}
        transition={{ duration: variant === "pulse" ? 1.5 : 3.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: `radial-gradient(circle, ${preset.accent}48 0%, transparent 68%)` }}
      />

      <div className={`relative z-10 flex flex-col items-center text-center ${compact ? "gap-3 px-5" : "gap-6 px-6"}`}>
        <motion.div
          className={`relative flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] ${compact ? "h-16 w-16" : "h-24 w-24 md:h-28 md:w-28"}`}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1, rotate: variant === "glitch" ? [0, -1, 1, 0] : 0 }}
          transition={{ duration: 0.7, rotate: { duration: 0.22, repeat: Infinity, repeatDelay: 1.5 } }}
          style={{ boxShadow: `0 0 0 1px ${preset.accent}1a, 0 0 40px ${preset.accent}22` }}
        >
          <motion.div
            className="absolute inset-1 rounded-full border border-dashed border-white/25"
            animate={{ rotate: 360 }}
            transition={{ duration: variant === "minimal" ? 4 : 8, repeat: Infinity, ease: "linear" }}
          />
          <Film className={iconSize} style={{ color: preset.accent }} strokeWidth={1.45} />
          <motion.span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#0a0c16]"
            animate={{ scale: [1, 1.14, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Play className="h-3.5 w-3.5 translate-x-px" style={{ color: preset.accent }} fill="currentColor" />
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65 }}
          className="space-y-2"
        >
          {!compact && (
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: preset.accent }}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Private Screening</span>
              <Clapperboard className="h-3.5 w-3.5" />
            </div>
          )}
          <h1 className={`${titleSize} font-bold tracking-[-0.035em] text-[#f8f1e7]`} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {preset.label}
          </h1>
          <p className={`${compact ? "text-xs" : "text-sm md:text-base"} text-white/55`}>{preset.caption}</p>
        </motion.div>

        <div className={`w-full ${compact ? "max-w-[12rem]" : "max-w-sm"}`}>
          <div className="mb-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
            <span>EvloevFilm</span>
            <span>Loading</span>
          </div>
          <div className="h-px overflow-hidden bg-white/15">
            <motion.div
              className="h-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: compact ? 3 : 4.65, ease: [0.22, 0.61, 0.36, 1] }}
              style={{ background: `linear-gradient(90deg, ${preset.accent} 0%, ${preset.accentSoft} 52%, ${preset.accent} 100%)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
