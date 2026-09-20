import { MovieCard } from "./MovieCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Movie { title: string; image: string; link: string; }
interface MovieGridProps { movies: Movie[] | null; className?: string; }

export function MovieGrid({ movies, className }: MovieGridProps) {
  if (!movies) return <div className="surface-panel p-8 text-center text-sm text-muted-foreground">Фильмы пока не найдены.</div>;

  return (
    <motion.div className={cn("grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5", className)} initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.045 } } }}>
      {movies.map((movie, index) => <motion.div key={movie.title + index} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.25, ease: "easeOut" }}><MovieCard {...movie} /></motion.div>)}
    </motion.div>
  );
}
