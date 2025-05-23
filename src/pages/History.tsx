import { Navigation } from "@/components/navigation/Navigation";
import { MovieGrid } from "@/components/MovieGrid";
import { getWatchHistory } from "@/utils/watchHistory";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Snowfall } from "@/components/Snowfall";

interface WatchHistoryItem {
  title: string;
  image: string;
  link: string;
  lastWatched: string;
  progress: number;
}

export default function History() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    const watchHistory = getWatchHistory();
    setHistory(watchHistory);
  }, []);

  const formatMovies = (movies: WatchHistoryItem[]) => {
    return movies.map(movie => ({
      title: `${movie.title} (${formatDistanceToNow(new Date(movie.lastWatched), { 
        addSuffix: true,
        locale: ru 
      })})`,
      image: movie.image || "/placeholder.svg", // Add fallback image
      link: movie.link
    }));
  };

  return (
    <div className="min-h-screen relative">
      <Snowfall />
      <Navigation />
      
      <main className="container pt-24 pb-16 space-y-8 relative z-10">
        <header>
          <h1 className="text-3xl font-bold">История просмотров</h1>
        </header>

        {history.length > 0 ? (
          <MovieGrid movies={formatMovies(history)} />
        ) : (
          <div className="text-center text-muted-foreground">
            История просмотров пуста
          </div>
        )}
      </main>
    </div>
  );
}
