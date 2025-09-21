import { Navigation } from "@/components/navigation/Navigation";
import { MovieGrid } from "@/components/MovieGrid";
import { useFirebaseStorage, HistoryItem } from "@/hooks/use-firebase-storage";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function History() {
  const { historyItems, loading, clearHistory } = useFirebaseStorage();

  const handleClearHistory = async () => {
    if (window.confirm("Вы уверены, что хотите очистить всю историю просмотров?")) {
      const success = await clearHistory();
      if (success) {
        toast.success("История просмотров очищена");
      } else {
        toast.error("Ошибка при очистке истории");
      }
    }
  };

  const formatMovies = (movies: HistoryItem[]) => {
    return movies.map(movie => ({
      title: `${movie.title} (${formatDistanceToNow(movie.watchedAt.toDate(), { 
        addSuffix: true,
        locale: ru 
      })})`,
      image: movie.poster || "/placeholder.svg",
      link: movie.url,
      id: movie.id,
      type: movie.type,
      year: movie.year,
      rating: movie.rating,
      description: movie.description,
      progress: movie.progress,
      episode: movie.episode
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AppWebGLBackground />
      <Navigation />
      
      <main className="container pt-24 pb-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-cinzel bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              История просмотров
            </h1>
            {historyItems.length > 0 && (
              <Button 
                onClick={handleClearHistory} 
                variant="destructive" 
                size="sm"
                className="rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить историю
              </Button>
            )}
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : historyItems.length > 0 ? (
            <MovieGrid movies={formatMovies(historyItems)} />
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <p className="text-lg">История просмотров пуста</p>
              <p className="text-sm mt-2">Начните смотреть фильмы, чтобы они появились в истории</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
