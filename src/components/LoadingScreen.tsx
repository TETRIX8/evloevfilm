import { motion } from "framer-motion";
import { useEffect } from "react";

export function LoadingScreen() {
  useEffect(() => {
    // Play sound effect when component mounts
    const audio = new Audio("/loading-sound.mp3");
    audio.volume = 0.3; // Reduce volume to 30%
    audio.play().catch(error => {
      console.log("Audio playback failed:", error);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Animated circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 border-2 border-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
          
          {/* Main logo text */}
          <motion.h1
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            animate={{
              backgroundPosition: ["0%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            EvloevFilm
          </motion.h1>
        </motion.div>
        
        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
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