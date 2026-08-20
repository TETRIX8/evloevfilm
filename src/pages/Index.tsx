
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
import { TBankAdvertisement } from "@/components/TBankAdvertisement";
import { RatingPopup } from "@/components/RatingPopup";
import { useRatingPopup } from "@/hooks/use-rating-popup";

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

  return <div id="yandex-ad-container" ref={adContainerRef} className="my-4 md:my-8"></div>;
};

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const currentYear = getCurrentYear().toString();
  const { showRatingPopup, setShowRatingPopup } = useRatingPopup();
  
  const { newMovies, newTVShows, newCartoons } = useMovies(currentYear);
  const { data: searchResults, error: searchError } = useMovieSearch(searchTerm);

  useEffect(() => {
    // После первой загрузки отключаем экран загрузки
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
      // Показываем рекламу сразу после загрузки
      setShowAd(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Show error toast if any query fails
  if (newMovies.error || newTVShows.error || newCartoons.error || searchError) {
    toast.error("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {isFirstLoad && <LoadingScreen />}
      
      {/* T-Bank Advertisement */}
      {showAd && <TBankAdvertisement />}
      
      {/* WebGL Background */}
      <AppWebGLBackground />
      
      <Navigation />
      
      <main className="container relative z-10 space-y-8 px-4 pb-20 pt-28 md:space-y-12 md:px-6 md:pb-28 md:pt-36">
        <header className="cinema-hero-copy mx-auto max-w-3xl space-y-5 py-2 text-center md:py-5">
          <h2 className="text-4xl font-bold leading-[0.98] tracking-[-0.045em] md:text-6xl">
            Найди свой любимый фильм
          </h2>
          <p className="mx-auto max-w-xl px-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Используйте поиск чтобы найти интересующий вас фильм
          </p>
          <div className="px-4 md:px-0">
            <SearchBar
              onSearch={setSearchTerm}
              className="mx-auto w-full max-w-md"
            />
          </div>
        </header>

        <div className="space-y-10 md:space-y-16">
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
      
      {/* Rating Popup after watching a movie */}
      <RatingPopup open={showRatingPopup} onOpenChange={setShowRatingPopup} />
    </div>
  );
}
