
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Film, Clapperboard, Camera, Star } from "lucide-react";

export function LoadingScreen() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
            {/* Анимированный логотип */}
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

            {/* Анимированный текст */}
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

            {/* Анимированные иконки */}
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

            {/* Полоса загрузки */}
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
