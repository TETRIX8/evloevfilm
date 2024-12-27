import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SearchResults } from "@/components/SearchResults";

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

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        return response;
      }
      
      // If response is not ok, throw an error to trigger retry
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      // Wait before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000)));
    }
  }
  throw new Error('Failed to fetch after retries');
}

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = getCurrentYear();

  const { data: newMovies, error: moviesError } = useQuery({
    queryKey: ["new-movies"],
    queryFn: async () => {
      console.log("Fetching new movies...");
      try {
        const url = new URL(BASE_URL);
        url.searchParams.append('token', API_TOKEN);
        url.searchParams.append('sort', '-views');
        url.searchParams.append('type', 'films');
        url.searchParams.append('limit', '50');
        url.searchParams.append('year', currentYear.toString());

        const response = await fetchWithRetry(url.toString());
        const data: ApiResponse = await response.json();
        console.log("New movies data:", data);
        
        return data.results?.map(movie => ({
          title: movie.name,
          image: movie.poster,
          link: movie.iframe_url
        })) || [];
      } catch (error) {
        console.error("Error fetching new movies:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  const { data: newTVShows, error: tvShowsError } = useQuery({
    queryKey: ["new-tvshows"],
    queryFn: async () => {
      console.log("Fetching new TV shows...");
      try {
        const url = new URL(BASE_URL);
        url.searchParams.append('token', API_TOKEN);
        url.searchParams.append('sort', '-views');
        url.searchParams.append('type', 'serials');
        url.searchParams.append('join_seasons', 'false');
        url.searchParams.append('limit', '50');
        url.searchParams.append('year', currentYear.toString());

        const response = await fetchWithRetry(url.toString());
        const data: ApiResponse = await response.json();
        return data.results?.map(show => ({
          title: show.name,
          image: show.poster,
          link: show.iframe_url
        })) || [];
      } catch (error) {
        console.error("Error fetching TV shows:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  const { data: newCartoons, error: cartoonsError } = useQuery({
    queryKey: ["new-cartoons"],
    queryFn: async () => {
      console.log("Fetching new cartoons...");
      try {
        const url = new URL(BASE_URL);
        url.searchParams.append('token', API_TOKEN);
        url.searchParams.append('sort', '-views');
        url.searchParams.append('type', 'cartoon');
        url.searchParams.append('limit', '50');
        url.searchParams.append('year', currentYear.toString());

        const response = await fetchWithRetry(url.toString());
        const data: ApiResponse = await response.json();
        return data.results?.map(cartoon => ({
          title: cartoon.name,
          image: cartoon.poster,
          link: cartoon.iframe_url
        })) || [];
      } catch (error) {
        console.error("Error fetching cartoons:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  const { data: searchResults, error: searchError } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      console.log("Fetching search results for:", searchTerm);
      if (!searchTerm) return null;
      try {
        const url = new URL(BASE_URL);
        url.searchParams.append('token', API_TOKEN);
        url.searchParams.append('name', searchTerm);

        const response = await fetchWithRetry(url.toString());
        const data: ApiResponse = await response.json();
        return data.results?.map(movie => ({
          title: movie.name,
          image: movie.poster,
          link: movie.iframe_url
        })) || [];
      } catch (error) {
        console.error("Error fetching search results:", error);
        throw error;
      }
    },
    enabled: searchTerm.length > 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  useEffect(() => {
    const errors = [moviesError, tvShowsError, cartoonsError, searchError];
    if (errors.some(error => error)) {
      toast.error("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    }
  }, [moviesError, tvShowsError, cartoonsError, searchError]);

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