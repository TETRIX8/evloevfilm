import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";

interface Movie {
  title: string;
  image: string;
  link: string;
}

interface ApiResponse {
  total: number;
  results: Array<{
    id: number;
    name: string;
    poster: string;
    iframe_url: string;
  }>;
}

const API_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const BASE_URL = "https://api1650820663.bhcesh.me/list";

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: recommendations, error: recommendationsError } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      console.log("Fetching recommendations...");
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&type=favorits`
      );
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      const data: ApiResponse = await response.json();
      console.log("Recommendations data:", data);
      
      return data.results?.map(movie => ({
        title: movie.name,
        image: movie.poster,
        link: movie.iframe_url
      })) || [];
    },
  });

  const { data: randomMovies, error: randomMoviesError } = useQuery({
    queryKey: ["random-movies"],
    queryFn: async () => {
      console.log("Fetching random movies...");
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&type=films&sort=random&limit=10`
      );
      if (!response.ok) throw new Error("Failed to fetch random movies");
      const data: ApiResponse = await response.json();
      console.log("Random movies data:", data);
      
      return data.results?.map(movie => ({
        title: movie.name,
        image: movie.poster,
        link: movie.iframe_url
      })) || [];
    },
  });

  const { data: searchResults, error: searchError } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      console.log("Fetching search results for:", searchTerm);
      if (!searchTerm) return null;
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&name=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error("Failed to fetch search results");
      const data: ApiResponse = await response.json();
      console.log("Search results:", data);
      
      return data.results?.map(movie => ({
        title: movie.name,
        image: movie.poster,
        link: movie.iframe_url
      })) || [];
    },
    enabled: searchTerm.length > 0,
  });

  useEffect(() => {
    if (recommendationsError || searchError || randomMoviesError) {
      toast.error("Failed to fetch movies. Please try again later.");
    }
  }, [recommendationsError, searchError, randomMoviesError]);

  return (
    <div className="min-h-screen">
      <Navigation />
      
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

        <div className="space-y-8">
          {searchTerm && (
            <section className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-semibold">Результаты поиска</h2>
              <MovieGrid movies={searchResults} />
            </section>
          )}

          {!searchTerm && (
            <>
              <section className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-semibold">Рекомендуемые фильмы</h2>
                <MovieGrid movies={recommendations} />
              </section>

              <section className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-semibold">Случайные подборки</h2>
                <MovieGrid movies={randomMovies} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}