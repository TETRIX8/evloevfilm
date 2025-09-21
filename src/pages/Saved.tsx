import { useEffect, useState } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { useFirebaseStorage, SavedItem } from "@/hooks/use-firebase-storage";
import { motion } from "framer-motion";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { Loader2 } from "lucide-react";

export default function Saved() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { savedItems, loading, removeFromSaved } = useFirebaseStorage();

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleRemoveFromSaved = async (itemId: string) => {
    await removeFromSaved(itemId);
  };

  // Преобразуем SavedItem в формат для MovieGrid
  const movies = savedItems.map(item => ({
    title: item.title,
    image: item.poster,
    link: item.url,
    savedAt: item.createdAt.toDate().toISOString(),
    id: item.id,
    type: item.type,
    year: item.year,
    rating: item.rating,
    description: item.description
  }));

  // Сортируем по дате
  const sortedMovies = [...movies].sort((a, b) => {
    const comparison = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
              Избранное
            </h1>
            <Button onClick={handleSort} variant="outline" className="rounded-xl">
              Сортировать по дате {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : sortedMovies.length > 0 ? (
            <MovieGrid movies={sortedMovies} />
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <p className="text-lg">У вас пока нет сохраненных фильмов</p>
              <p className="text-sm mt-2">Добавьте фильмы в избранное, чтобы они появились здесь</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}