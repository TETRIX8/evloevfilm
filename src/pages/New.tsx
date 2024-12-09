import { useQuery } from "@tanstack/react-query";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";

const API_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const BASE_URL = "https://api1673051707.bhcesh.me/list";

export default function New() {
  const { data: newMovies, error } = useQuery({
    queryKey: ["new-movies"],
    queryFn: async () => {
      console.log("Fetching new movies...");
      const response = await fetch(
        `${BASE_URL}?token=${API_TOKEN}&sort=-views&type=films&limit=50&year=2024`
      );
      if (!response.ok) throw new Error("Failed to fetch new movies");
      const data = await response.json();
      console.log("New movies data:", data);
      
      return data.results?.map((movie: any) => ({
        title: movie.name,
        image: movie.poster,
        link: movie.iframe_url
      })) || [];
    },
  });

  if (error) {
    toast.error("Failed to fetch new movies. Please try again later.");
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container pt-24 pb-16 space-y-8">
        <header className="space-y-4">
          <h2 className="text-4xl font-bold">
            Новинки 2024
          </h2>
          <p className="text-muted-foreground">
            Самые свежие фильмы этого года
          </p>
        </header>

        <MovieGrid movies={newMovies} />
      </main>
    </div>
  );
}