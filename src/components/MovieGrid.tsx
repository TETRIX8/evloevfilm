
import { MovieCard } from "./MovieCard";
import { motion } from "framer-motion";

interface Movie {
  title: string;
  image: string;
  link: string;
}

interface MovieGridProps {
  movies: Movie[] | null;
  className?: string;
}

export function MovieGrid({ movies, className }: MovieGridProps) {
  if (!movies) {
    return <div className="text-muted-foreground">Фильмы не найдены</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {movies.map((movie, index) => (
        <motion.div 
          key={movie.title + index} 
          variants={item}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <MovieCard {...movie} />
        </motion.div>
      ))}
    </motion.div>
  );
}
