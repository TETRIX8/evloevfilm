
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Film, Clapperboard, Camera, Star } from "lucide-react";

export function LoadingScreen() {
  const [showLoader, setShowLoader] = useState(true);
  const [animationStyle, setAnimationStyle] = useState("default");
  const [simplifiedMode, setSimplifiedMode] = useState(false);

  useEffect(() => {
    // Get animation style from localStorage
    const savedAnimation = localStorage.getItem("loadingAnimation");
    if (savedAnimation) {
      setAnimationStyle(savedAnimation);
    }
    
    // Check if simplified mode is enabled
    const isSimplified = localStorage.getItem("simplifiedMode") === "true";
    setSimplifiedMode(isSimplified);
    
    // Hide loader after timeout
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // For simplified mode, use minimal loading screen
  if (simplifiedMode) {
    return (
      <AnimatePresence>
        {showLoader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="text-center">
              <Film className="w-16 h-16 text-primary mx-auto" />
              <h2 className="mt-4 text-2xl font-bold">Загрузка...</h2>
              <div className="mt-4 h-2 w-64 bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary" style={{width: "100%"}} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Default animation
  if (animationStyle === "default") {
    return (
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
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
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold tracking-wider"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    EvloevFilm
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-xl text-muted-foreground"
                >
                  Добро пожаловать в мир кино
                </motion.p>
              </div>

              {/* Animated icons */}
              <div className="flex justify-center gap-8">
                {[Camera, Clapperboard, Film].map((Icon, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1.5 + index * 0.2,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <Icon className="w-8 h-8 text-primary" />
                  </motion.div>
                ))}
              </div>

              {/* Loading bar */}
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "easeInOut" }}
                className="h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto max-w-md"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  // Minimal animation
  if (animationStyle === "minimal") {
    return (
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  // Pulse animation
  if (animationStyle === "pulse") {
    return (
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  // Cascade animation
  if (animationStyle === "cascade") {
    return (
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  // Glitch animation
  if (animationStyle === "glitch") {
    return (
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  // Fallback to default if animation type not recognized
  return (
    <AnimatePresence>
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-center">
            <Film className="w-16 h-16 text-primary mx-auto" />
            <h2 className="mt-4 text-xl">Загрузка...</h2>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
