import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardOverlayProps {
  title: string;
  onClick: (e: React.MouseEvent) => void;
}

export function MovieCardOverlay({ title, onClick }: MovieCardOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="absolute bottom-0 p-4 w-full">
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-semibold text-lg truncate"
        >
          {title}
        </motion.h3>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-2 flex items-center gap-2 text-primary"
        >
          <Play className="h-4 w-4" />
          <span className="text-sm">Смотреть</span>
        </motion.div>
      </div>
    </motion.div>
  );
}