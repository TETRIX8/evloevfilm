import { motion } from "framer-motion";
import { useEffect } from "react";
import { soundEffects } from "@/utils/soundEffects";

export function LoadingScreen() {
  useEffect(() => {
    soundEffects.play("load");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="text-center space-y-8">
        <motion.div 
          className="text-6xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            initial={{ letterSpacing: "1em", opacity: 0 }}
            animate={{ letterSpacing: "normal", opacity: 1 }}
            transition={{ 
              duration: 1.5,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 0.2
            }}
          >
            EvloevFilm
          </motion.span>
        </motion.div>

        {/* Animated circles with pulse effect */}
        <div className="relative w-32 h-32 mx-auto">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        
        {/* Loading dots with bounce effect */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0.5, 1, 0.5],
                y: [0, -8, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className="w-3 h-3 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}