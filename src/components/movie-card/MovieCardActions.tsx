import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MovieCardActionsProps {
  isHovered: boolean;
  isLiked: boolean;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

export function MovieCardActions({ isHovered, isLiked, onLike, onShare }: MovieCardActionsProps) {
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
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
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