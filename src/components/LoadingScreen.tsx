import { motion } from "framer-motion";
import { useEffect } from "react";

export function LoadingScreen() {
  useEffect(() => {
    const audio = new Audio("/loading-sound.mp3");
    audio.volume = 0.3;
    audio.play().catch(error => {
      console.log("Audio playback failed:", error);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const bounceTransition = {
    y: {
      duration: 0.6,
      yoyo: 3,
      ease: "easeOut"
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <div className="text-center space-y-8">
        <div className="relative h-24">
          {/* Bouncing E animation */}
          <motion.span
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: [null, 20, -20, 0],
              opacity: 1,
              scale: [1, 0.8, 1.2, 1]
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.4, 0.7, 1],
              ease: "easeInOut"
            }}
            className="absolute text-6xl font-bold text-primary"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            E
          </motion.span>

          {/* Rest of the text that fades in */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            vloevFilm
          </motion.span>
        </div>

        {/* Animated circles */}
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
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        
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
