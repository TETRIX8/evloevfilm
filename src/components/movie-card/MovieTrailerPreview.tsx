import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

interface MovieTrailerPreviewProps {
  isHovered: boolean;
  link: string;
}

export function MovieTrailerPreview({ isHovered, link }: MovieTrailerPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="absolute inset-0 z-20 overflow-hidden bg-[#060812]"
        >
          <video
            src="/cinematic-preview.mp4"
            poster="/cinematic-preview-cover.png"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060812]/92 via-[#060812]/28 to-black/28" />

          <iframe
            src={`${link}?autoplay=1&mute=1`}
            title="Трейлер фильма"
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
            allow="autoplay; encrypted-media"
            onLoad={() => setIsLoaded(true)}
          />

          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <motion.div
                initial={{ scale: 0.86, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="cinema-play-button"
              >
                <Play className="h-5 w-5 translate-x-px" fill="currentColor" />
              </motion.div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">Кинематографичное превью</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
