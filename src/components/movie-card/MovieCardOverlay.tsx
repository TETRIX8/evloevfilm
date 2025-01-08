import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface MovieCardOverlayProps {
  title: string;
}

export function MovieCardOverlay({ title }: MovieCardOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute bottom-0 p-6 w-full">
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-cinzel text-2xl font-bold tracking-wide truncate mb-2 text-white drop-shadow-lg"
        >
          {title}
        </motion.h3>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 text-primary"
        >
          <Play className="h-5 w-5" />
          <span className="text-sm font-medium">Смотреть</span>
        </motion.div>
      </div>
    </motion.div>
  );
}