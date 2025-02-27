
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { MovieOverlayProps } from "./types";

export function MovieOverlay({ title, onClick }: MovieOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="absolute bottom-0 p-6 w-full">
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
