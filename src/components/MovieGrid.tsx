import { MovieCard } from "./MovieCard";

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
    return <div className="text-muted-foreground">No movies available</div>;
  }

  if (!Array.isArray(movies)) {
    console.error("Movies prop is not an array:", movies);
    return <div className="text-muted-foreground">Error loading movies</div>;
  }

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