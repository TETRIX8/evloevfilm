import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { MovieCardOverlayProps } from "./types";

export function MovieCardOverlay({
  title,
  image,
  isHovered,
  aspectRatio,
  onPlay,
}: MovieCardOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-10 cursor-pointer bg-gradient-to-t from-[#070914] via-[#070914]/28 to-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: isHovered ? 1 : 0 }}
      transition={{ duration: 0.28 }}
      onClick={onPlay}
    >
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 12, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary"
        >
          <span className="h-px w-5 bg-primary/80" />
          <span>Смотреть</span>
        </motion.div>
        <motion.h3
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.32, delay: 0.04 }}
          className="mb-3 truncate text-lg font-bold leading-tight tracking-[-0.025em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] md:text-xl"
        >
          {title}
        </motion.h3>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: isHovered ? 1 : 0.9, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="cinema-play-button h-10 w-10"
        >
          <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
        </motion.div>
      </div>
    </motion.div>
  );
}
