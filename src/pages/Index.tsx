import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { MovieGrid } from "@/components/MovieGrid";
import { toast } from "sonner";

interface Movie {
  title: string;
  image: string;
  link: string;
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
      const data = await response.json();
      console.log("Recommendations data:", data);
      return data as Movie[];
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
      const data = await response.json();
      console.log("Search results:", data);
      return data as Movie[];
    },
    enabled: searchTerm.length > 0,
  });

  useEffect(() => {
    if (recommendationsError || searchError) {
      toast.error("Failed to fetch movies. Please try again later.");
    }
  }, [recommendationsError, searchError]);

  return (
    <div className="min-h-screen p-6 space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
          Movie Stream
        </h1>
        <SearchBar
          onSearch={setSearchTerm}
          className="mx-auto"
        />
      </header>

      <main className="space-y-8">
        {searchTerm && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Search Results</h2>
            <MovieGrid movies={searchResults} />
          </section>
        )}

        {!searchTerm && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Recommended Movies</h2>
            <MovieGrid movies={recommendations} />
          </section>
        )}
      </main>
    </div>
  );
}