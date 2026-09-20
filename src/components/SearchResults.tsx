import { Search } from "lucide-react";
import { MovieGrid } from "./MovieGrid";

interface Movie { title: string; image: string; link: string; }
interface SearchResultsProps { searchTerm: string; results: Movie[] | null; }

export function SearchResults({ searchTerm, results }: SearchResultsProps) {
  if (!searchTerm) return null;
  return (
    <section className="animate-fade-in space-y-6">
      <div className="surface-panel flex items-center gap-4 px-5 py-5 sm:px-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Search className="h-4 w-4" /></span><div><p className="section-eyebrow">Результаты поиска</p><h2 className="mt-1 text-lg font-extrabold">По запросу «{searchTerm}»</h2></div></div>
      <MovieGrid movies={results} />
    </section>
  );
}
