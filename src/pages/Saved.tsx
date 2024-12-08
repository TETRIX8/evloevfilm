import { useEffect, useState } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";

interface SavedMovie {
  title: string;
  image: string;
  link: string;
  savedAt: string;
}

export default function Saved() {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const movies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    setSavedMovies(movies);
  }, []);

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...savedMovies].sort((a, b) => {
      const comparison = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      return newOrder === 'asc' ? comparison : -comparison;
    });
    setSavedMovies(sorted);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container pt-24 pb-16 space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Сохраненные фильмы</h1>
          <Button onClick={handleSort} variant="outline">
            Сортировать по дате {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </header>

        {savedMovies.length > 0 ? (
          <MovieGrid movies={savedMovies} />
        ) : (
          <div className="text-center text-muted-foreground">
            У вас пока нет сохраненных фильмов
          </div>
        )}
      </main>
    </div>
  );
}