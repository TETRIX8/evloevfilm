
import { motion } from "framer-motion";
import { Film, Clapperboard, Camera, Star } from "lucide-react";

interface LoadingPreviewProps {
  animation: string;
}

export function LoadingPreview({ animation }: LoadingPreviewProps) {
  // Default animation (spinning stars)
  if (animation === "default") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center space-y-8">
          {/* Animated logo */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-32 h-32 mx-auto"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
              className="absolute inset-0"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-full"
                  style={{ 
                    transform: `rotate(${i * 45}deg)`,
                  }}
                >
                  <Star className="w-6 h-6 text-primary absolute top-0 left-1/2 -translate-x-1/2" />
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Film className="w-16 h-16 text-primary" />
            </motion.div>
          </motion.div>

          {/* Animated text */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold tracking-wider"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                EvloevFilm
              </span>
            </motion.h1>
          </div>

          {/* Loading bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto max-w-md"
          />
        </div>
      </div>
    );
  }
  
  // Minimal animation
  if (animation === "minimal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { duration: 2, repeat: Infinity, ease: "linear" } 
            }}
          >
            <Film className="w-16 h-16 text-primary" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="mt-4 text-2xl font-semibold"
          >
            Загрузка...
          </motion.h2>
        </div>
      </div>
    );
  }
  
  // Pulse animation
  if (animation === "pulse") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto"
          >
            <Film className="w-20 h-20 text-primary" />
          </motion.div>
          
          <motion.h1
            animate={{ 
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="text-3xl font-bold"
          >
            EvloevFilm
          </motion.h1>
        </div>
      </div>
    );
  }
  
  // Cascade animation
  if (animation === "cascade") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex space-x-4">
            {[Film, Camera, Clapperboard].map((Icon, index) => (
              <motion.div
                key={index}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: index * 0.3,
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 2
                }}
              >
                <Icon className="w-12 h-12 text-primary" />
              </motion.div>
            ))}
          </div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-3xl font-bold"
          >
            EvloevFilm
          </motion.h1>
          
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-1 bg-primary rounded-full w-64"
          />
        </div>
      </div>
    );
  }
  
  // Glitch animation
  if (animation === "glitch") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            animate={{ 
              x: [0, -3, 5, -5, 3, 0],
              opacity: [1, 0.8, 1, 0.9, 1]
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="relative"
          >
            <Film className="w-20 h-20 text-primary absolute opacity-70 -left-1" />
            <Film className="w-20 h-20 text-cyan-500 absolute opacity-70 left-1" />
            <Film className="w-20 h-20 text-red-500 absolute opacity-70" />
          </motion.div>
          
          <div className="h-16"></div>
          
          <motion.h1
            animate={{ 
              x: [0, -2, 3, -3, 2, 0],
              y: [0, 1, -1, 1, -1, 0]
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="text-3xl font-bold mt-4 relative"
          >
            <span className="absolute text-red-500 opacity-70 -left-1">EvloevFilm</span>
            <span className="absolute text-cyan-500 opacity-70 left-1">EvloevFilm</span>
            <span className="relative">EvloevFilm</span>
          </motion.h1>
        </div>
      </div>
    );
  }
  
  // Fallback if animation not found
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <Film className="w-16 h-16 text-primary mx-auto" />
        <p className="mt-4">Предпросмотр недоступен</p>
      </div>
    </div>
  );
}
