
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MovieActionsProps } from "./types";

export function MovieActions({ isHovered, isLiked, isLoading, onLike, onShare }: MovieActionsProps) {
  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 right-2 flex gap-2"
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={onLike}
            disabled={isLoading}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            >
              <Heart className={cn("h-4 w-4", isLiked ? "fill-primary text-primary" : "")} />
            </motion.div>
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={onShare}
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <Share2 className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
