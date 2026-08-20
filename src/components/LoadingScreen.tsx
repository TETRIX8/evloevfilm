import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Film } from "lucide-react";
import { CinematicLoadingStage } from "./animations/CinematicLoadingStage";

export function LoadingScreen() {
  const [showLoader, setShowLoader] = useState(true);
  const [animationStyle, setAnimationStyle] = useState("snowflake");
  const [simplifiedMode, setSimplifiedMode] = useState(false);

  useEffect(() => {
    setAnimationStyle(localStorage.getItem("loadingAnimation") || "snowflake");
    setSimplifiedMode(localStorage.getItem("simplifiedMode") === "true");

    const timer = setTimeout(() => setShowLoader(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (simplifiedMode) {
    return (
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
            <div className="text-center">
              <Film className="mx-auto h-16 w-16 text-primary" />
              <h2 className="mt-4 text-2xl font-bold">Загрузка...</h2>
              <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full bg-primary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="fixed inset-0 z-[60]"
        >
          <CinematicLoadingStage variant={animationStyle} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
