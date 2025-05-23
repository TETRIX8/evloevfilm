
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SearchBar } from "@/components/SearchBar";
import { Navigation } from "@/components/navigation/Navigation";
import { MovieCarousel } from "@/components/MovieCarousel";
import { SearchResults } from "@/components/SearchResults";
import { useMovies, useMovieSearch } from "@/hooks/use-movies";
import { AIAssistant } from "@/components/ai-assistant/AIAssistant";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PopularMoviesSlideshow } from "@/components/PopularMoviesSlideshow";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";

// Get current year in Moscow timezone
const getCurrentYear = () => {
  const moscowDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  return moscowDate.getFullYear();
};

// Компонент для рекламы Яндекс.РСЯ
const YandexAdBlock = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Проверяем, что window.yaContextCb доступен
    if (window.yaContextCb && adContainerRef.current) {
      // Добавляем рекламный блок
      window.yaContextCb.push(() => {
        // @ts-ignore - игнорируем ошибку типизации, так как Ya не объявлен в типах
        if (window.Ya && window.Ya.Context) {
          window.Ya.Context.AdvManager.render({
            blockId: "R-A-15455708-1",
            type: "fullscreen",
            platform: "touch",
            renderTo: adContainerRef.current?.id || ""
          });
        }
      });
    }
  }, []);

  return <div id="yandex-ad-container" ref={adContainerRef} className="my-8"></div>;
};

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const currentYear = getCurrentYear().toString();
  
  const { newMovies, newTVShows, newCartoons } = useMovies(currentYear);
  const { data: searchResults, error: searchError } = useMovieSearch(searchTerm);

  useEffect(() => {
    // После первой загрузки отключаем экран загрузки
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Show error toast if any query fails
  if (newMovies.error || newTVShows.error || newCartoons.error || searchError) {
    toast.error("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
  }

  return (
    <div className="min-h-screen">
      {isFirstLoad && <LoadingScreen />}
      
      {/* WebGL Background */}
      <AppWebGLBackground />
      
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
              <PopularMoviesSlideshow />
              
              <MovieCarousel 
                title={`Новые фильмы ${currentYear}`}
                movies={newMovies.data}
              />

              {/* Рекламный блок после первой карусели */}
              <YandexAdBlock />

              <MovieCarousel 
                title={`Новые сериалы ${currentYear}`}
                movies={newTVShows.data}
              />

              <MovieCarousel 
                title={`Новые мультфильмы ${currentYear}`}
                movies={newCartoons.data}
              />
            </>
          )}
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
