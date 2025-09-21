import { motion } from "framer-motion";
import { AnimeCard } from "./AnimeCard";
import { KodikAnimeItem } from "@/services/kodik-api";

interface AnimeGridProps {
  animes: KodikAnimeItem[];
  className?: string;
}

export function AnimeGrid({ animes, className }: AnimeGridProps) {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 ${className}`}
    >
      {animes.map((anime, index) => (
        <AnimeCard key={anime.id} anime={anime} index={index} />
      ))}
    </motion.div>
  );
}