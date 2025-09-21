import { MovieGrid } from "./MovieGrid";

interface Movie {
  title: string;
  image: string;
  link: string;
}

interface SearchResultsProps {
  searchTerm: string;
  results: Movie[] | null;
}

export function SearchResults({ searchTerm, results }: SearchResultsProps) {
  if (!searchTerm) return null;

  return (
    <section className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold">Результаты поиска</h2>
      <MovieGrid movies={results} />
    </section>
  );
}