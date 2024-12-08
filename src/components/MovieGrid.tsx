import { MovieCard } from "./MovieCard";

interface Movie {
  title: string;
  image: string;
  link: string;
}

interface MovieGridProps {
  movies: Movie[];
  className?: string;
}

export function MovieGrid({ movies, className }: MovieGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
      {movies.map((movie, index) => (
        <div key={movie.title + index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <MovieCard {...movie} />
        </div>
      ))}
    </div>
  );
}