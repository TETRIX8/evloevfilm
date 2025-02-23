
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { MovieGrid } from "@/components/MovieGrid";

interface AnimeResult {
  title: string;
  title_orig: string;
  link: string;
  screenshots: string[];
  year: number;
}

interface AnimeApiResponse {
  total: number;
  results: AnimeResult[];
}

const fetchAnime = async (searchTerm: string = "") => {
  const baseUrl = "https://kodikapi.com/list";
  const token = "54eb773d434f45f4c9bb462bc3ce0342";
  const url = `${baseUrl}?token=${token}${searchTerm ? `&title=${searchTerm}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch anime");
  const data: AnimeApiResponse = await response.json();
  
  return data.results.map(anime => ({
    title: anime.title || anime.title_orig,
    image: anime.screenshots?.[0] || "/placeholder.svg",
    link: anime.link
  }));
};

export default function Anime() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: animeList, error } = useQuery({
    queryKey: ["anime", searchTerm],
    queryFn: () => fetchAnime(searchTerm),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (error) {
    toast.error("Failed to load anime");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5]/10 to-background">
      <Navigation />
      
      <main className="container pt-24 pb-16 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-[#9b87f5] to-[#D946EF] text-transparent bg-clip-text">
            Аниме
          </h1>
          <p className="text-muted-foreground text-center">
            Найдите любимое аниме для просмотра
          </p>
          <SearchBar
            onSearch={setSearchTerm}
            className="mx-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MovieGrid movies={animeList || []} />
        </motion.div>
      </main>
    </div>
  );
}
