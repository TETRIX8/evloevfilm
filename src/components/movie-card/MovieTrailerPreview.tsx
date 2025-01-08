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
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            <iframe
              src={`${link}?autoplay=1&mute=1`}
              className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              allow="autoplay; encrypted-media"
              onLoad={() => setIsLoaded(true)}
            />
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-12 h-12 text-white animate-pulse" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}