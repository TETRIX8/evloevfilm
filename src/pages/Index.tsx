import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SearchResults } from "@/components/SearchResults";
import { VideoBackground } from "@/components/VideoBackground";

const API_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const BASE_URL = "https://api1673051707.bhcesh.me/list";

// Get current year in Moscow timezone
const getCurrentYear = () => {
  const moscowDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  return moscowDate.getFullYear();
};

interface ApiResponse {
  total: number;
  results: Array<{
    id: number;
    name: string;
    poster: string;
    iframe_url: string;
  }>;
}

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = getCurrentYear();

  const { data: newMovies, error: moviesError } = useQuery({
    queryKey: ["new-movies"],
    queryFn: async () => {
      console.log("Fetching new movies...");
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&sort=-views&type=films&limit=50&year=${currentYear}`
      );
      if (!response.ok) throw new Error("Failed to fetch new movies");
      const data: ApiResponse = await response.json();
      return data.results?.map(movie => ({
        title: movie.name,
        image: movie.poster,
        link: movie.iframe_url
      })) || [];
    },
  });

  const { data: newTVShows, error: tvShowsError } = useQuery({
    queryKey: ["new-tvshows"],
    queryFn: async () => {
      console.log("Fetching new TV shows...");
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&sort=-views&type=serials&join_seasons=false&limit=50&year=${currentYear}`
      );
      if (!response.ok) throw new Error("Failed to fetch new TV shows");
      const data: ApiResponse = await response.json();
      return data.results?.map(show => ({
        title: show.name,
        image: show.poster,
        link: show.iframe_url
      })) || [];
    },
  });

  const { data: newCartoons, error: cartoonsError } = useQuery({
    queryKey: ["new-cartoons"],
    queryFn: async () => {
      console.log("Fetching new cartoons...");
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&sort=-views&type=cartoon&limit=50&year=${currentYear}`
      );
      if (!response.ok) throw new Error("Failed to fetch new cartoons");
      const data: ApiResponse = await response.json();
      return data.results?.map(cartoon => ({
        title: cartoon.name,
        image: cartoon.poster,
        link: cartoon.iframe_url
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
      return data.results?.map(movie => ({
        title: movie.name,
        image: movie.poster,
        link: movie.iframe_url
      })) || [];
    },
    enabled: searchTerm.length > 0,
  });

  useEffect(() => {
    const errors = [moviesError, tvShowsError, cartoonsError, searchError];
    if (errors.some(error => error)) {
      toast.error("Failed to fetch data. Please try again later.");
    }
  }, [moviesError, tvShowsError, cartoonsError, searchError]);

  return (
    <div className="min-h-screen">
      <VideoBackground />
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

        <div className="space-y-12">
          <SearchResults searchTerm={searchTerm} results={searchResults} />

          {!searchTerm && (
            <>
              <MovieCarousel 
                title={`Новые фильмы ${currentYear}`}
                movies={newMovies}
              />

              <MovieCarousel 
                title={`Новые сериалы ${currentYear}`}
                movies={newTVShows}
              />

              <MovieCarousel 
                title={`Новые мультфильмы ${currentYear}`}
                movies={newCartoons}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}