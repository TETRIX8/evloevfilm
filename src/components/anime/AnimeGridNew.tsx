import { motion } from "framer-motion";
import { AnimeCardNew } from "./AnimeCardNew";
import { AnimeSearchItem } from "@/services/anitype-api";

interface AnimeGridNewProps {
  animes: AnimeSearchItem[];
  className?: string;
}

export function AnimeGridNew({ animes, className = "" }: AnimeGridNewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (!animes || animes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎌</div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Нет доступных аниме
        </h3>
        <p className="text-sm text-muted-foreground">
          Попробуйте изменить параметры поиска или обновите страницу
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 ${className}`}
    >
      {animes.map((anime, index) => (
        <AnimeCardNew 
          key={anime.id} 
          anime={anime} 
          index={index}
        />
      ))}
    </motion.div>
  );
}