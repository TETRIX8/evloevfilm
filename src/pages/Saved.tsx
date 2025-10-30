import { useEffect, useState } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { useFirebaseStorage, SavedItem } from "@/hooks/use-firebase-storage";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { motion } from "framer-motion";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Saved() {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user, loading: authLoading } = useFirebaseAuth();
  const { savedItems, loading, removeFromSaved, loadSavedItems } = useFirebaseStorage();
  
  // Проверка авторизации
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Пожалуйста, войдите в систему для просмотра избранного");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  // Логирование для отладки
  useEffect(() => {
    console.log("Saved page - User:", user);
    console.log("Saved page - Loading:", loading);
    console.log("Saved page - Saved items:", savedItems);
  }, [user, loading, savedItems]);

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

  // Если все еще загружается авторизация
  if (authLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <AppWebGLBackground />
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Если пользователь не авторизован
  if (!user) {
    return null;
  }

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
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-cinzel bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
                Избранное
              </h1>
              {user && (
                <p className="text-sm text-muted-foreground">
                  {user.displayName || user.email}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSort} variant="outline" className="rounded-xl">
                Сортировать по дате {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              <Button onClick={loadSavedItems} variant="outline" className="rounded-xl">
                Обновить
              </Button>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Загрузка избранного...</p>
            </div>
          ) : sortedMovies.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Найдено: {sortedMovies.length} {sortedMovies.length === 1 ? 'фильм' : 'фильмов'}
              </p>
              <MovieGrid movies={sortedMovies} />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16 space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-lg">У вас пока нет сохраненных фильмов</p>
              <p className="text-sm mt-2">Добавьте фильмы в избранное, чтобы они появились здесь</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Перейти к фильмам
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}