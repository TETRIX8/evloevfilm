import { useState } from "react";
import { toast } from "sonner";
import { SearchBar } from "@/components/SearchBar";
import { Navigation } from "@/components/Navigation";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SearchResults } from "@/components/SearchResults";
import { useMovies, useMovieSearch } from "@/hooks/use-movies";
import { MovieSuggestion } from "@/components/MovieSuggestion";

// Get current year in Moscow timezone
const getCurrentYear = () => {
  const moscowDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  return moscowDate.getFullYear();
};

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = getCurrentYear().toString();
  
  const { newMovies, newTVShows, newCartoons } = useMovies(currentYear);
  const { data: searchResults, error: searchError } = useMovieSearch(searchTerm);

  // Show error toast if any query fails
  if (newMovies.error || newTVShows.error || newCartoons.error || searchError) {
    toast.error("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <MovieSuggestion />
      
      <main className="container pt-24 pb-16 space-y-8">
        <header className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl font-bold text-center">
            Найди свой любимый фильм
          </h2>
          <p className="text-muted-foreground text-center">
            Используйте поиск чтобы найти интересующий вас фильм
          </p>
          <SearchBar
            onSearch={setSearchTerm}
            className="mx-auto"
          />
        </header>

        <div className="space-y-12">
          <SearchResults searchTerm={searchTerm} results={searchResults} />

          {!searchTerm && (
            <>
              <MovieCarousel 
                title={`Новые фильмы ${currentYear}`}
                movies={newMovies.data}
              />

              <MovieCarousel 
                title={`Новые сериалы ${currentYear}`}
                movies={newTVShows.data}
              />

              <MovieCarousel 
                title={`Новые мультфильмы ${currentYear}`}
                movies={newCartoons.data}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
