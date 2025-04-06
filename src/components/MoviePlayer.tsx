import { ArrowLeft, Heart, Share2, Search, Star, Clock, Globe, Award, Play } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { soundEffects } from "../utils/soundEffects";
import { addToWatchHistory, updateWatchProgress } from "../utils/watchHistory";
import { fetchMovieDetails, searchMovies } from "@/services/api";
import { VPNAdvertisement } from "./VPNAdvertisement";
import { fetchKinopoiskMovie, fetchMovieStills, type KinopoiskMovie, type MovieStill } from "@/services/kinopoisk";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllohaMovieDetails, type AllohaMovieData } from "@/services/alloha-api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Вспомогательная функция для преобразования строки или массива в массив
const ensureArray = (data: string | string[] | undefined): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data]; // Если это строка, оборачиваем её в массив
};

interface MoviePlayerProps {
  title: string;
  iframeUrl: string;
}

export function MoviePlayer({ title, iframeUrl }: MoviePlayerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const [showVPNAd, setShowVPNAd] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const imageUrl = location.state?.image || "/placeholder.svg";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [kinopoiskData, setKinopoiskData] = useState<KinopoiskMovie | null>(null);
  const [allohaDetails, setAllohaDetails] = useState<AllohaMovieData | null>(null);
  const [movieStills, setMovieStills] = useState<MovieStill[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showAllohaInfo, setShowAllohaInfo] = useState(false);
  const [adBlockEnabled] = useState(() => {
    return localStorage.getItem("adBlockEnabled") === "true";
  });

  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    const isSaved = savedMovies.some((movie: any) => movie.title === title);
    setIsLiked(isSaved);

    const fetchDetails = async () => {
      const details = await fetchMovieDetails(title);
      setMovieDetails(details);

      if (details?.kinopoisk_id) {
        // Получаем данные от Kinopoisk API
        const kinopoiskDetails = await fetchKinopoiskMovie(details.kinopoisk_id);
        setKinopoiskData(kinopoiskDetails);
        
        // Получаем кадры из фильма
        const stills = await fetchMovieStills(details.kinopoisk_id);
        setMovieStills(stills);
        
        // Получаем расширенные данные от Alloha API
        const allohaData = await fetchAllohaMovieDetails(details.kinopoisk_id);
        setAllohaDetails(allohaData);
      }
    };

    fetchDetails();

    if (showPlayer) {
      addToWatchHistory({
        title,
        image: imageUrl,
        link: iframeUrl
      });
    }

    const interval = setInterval(() => {
      if (iframeRef.current) {
        const progress = Math.random();
        updateWatchProgress(title, progress);
      }
    }, 30000);

    if (adBlockEnabled && iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const style = iframeDoc.createElement('style');
            style.textContent = `
              [class*="ad-"], [class*="ads-"], [id*="ad-"], [id*="ads-"],
              [class*="advertisement"], [id*="advertisement"],
              iframe[src*="doubleclick.net"], iframe[src*="googlesyndication.com"],
              div[data-ad], div[data-ads], div[data-adunit],
              .video-ads, .adsbygoogle { display: none !important; }
            `;
            iframeDoc.head.appendChild(style);
          }
        } catch (error) {
          console.log("Ad blocking failed due to same-origin policy");
        }
      };
    }

    return () => clearInterval(interval);
  }, [title, imageUrl, iframeUrl, adBlockEnabled, showPlayer]);

  const handleLike = () => {
    soundEffects.play("click");
    const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    if (!isLiked) {
      savedMovies.push({
        title,
        image: imageUrl,
        link: iframeUrl,
        savedAt: new Date().toISOString()
      });
      toast("Фильм добавлен в сохраненные");
    } else {
      const index = savedMovies.findIndex((movie: any) => movie.title === title);
      if (index > -1) savedMovies.splice(index, 1);
      toast("Фильм удален из сохраненных");
    }
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    soundEffects.play("click");
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        url: shareUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        toast.error("Ошибка при попытке поделиться");
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Ссылка скопирована в буфер обмена");
    }
  };

  const handleBack = () => {
    soundEffects.play("click");
    navigate(-1);
  };

  const handleFindSimilar = async () => {
    soundEffects.play("click");
    
    // Get genre information from either Alloha or Kinopoisk data
    let genre = "";
    if (allohaDetails?.genre) {
      genre = allohaDetails.genre;
    } else if (kinopoiskData?.genres?.length > 0) {
      genre = kinopoiskData.genres.map(g => g.name).join(" ");
    }
    
    if (genre) {
      try {
        // Show loading toast
        toast.loading("Поиск похожих фильмов...");
        
        // Search for movies with similar genre
        const results = await searchMovies(genre);
        
        if (results && results.length > 0) {
          // Filter out the current movie from results
          const similarMovies = results.filter(movie => 
            movie.title.toLowerCase() !== title.toLowerCase()
          ).slice(0, 5);
          
          if (similarMovies.length > 0) {
            toast.dismiss();
            toast.success(`Найдено ${similarMovies.length} похожих фильмов`);
            
            // Display information in AI chat
            const chatIframe = document.querySelector('iframe[name="chat-iframe"]') as HTMLIFrameElement;
            if (chatIframe?.contentWindow) {
              chatIframe.contentWindow.postMessage({ type: 'OPEN_CHAT' }, '*');
              
              const movieList = similarMovies.map((movie, index) => 
                `${index + 1}. **${movie.title}** (${movie.year}) - ${movie.kinopoisk_rating || "нет рейтинга"}`
              ).join("\n");
              
              const message = `Вот похожие фильмы на "${title}" по жанру "${genre}":\n\n${movieList}\n\nЧтобы получить более подробную информацию о любом из этих фильмов, просто спросите меня.`;
              
              setTimeout(() => {
                chatIframe.contentWindow.postMessage({ 
                  type: 'SEND_MESSAGE',
                  message
                }, '*');
              }, 500);
            }
          } else {
            toast.dismiss();
            handleFallbackChatRequest();
          }
        } else {
          toast.dismiss();
          handleFallbackChatRequest();
        }
      } catch (error) {
        toast.dismiss();
        console.error("Error searching for similar movies:", error);
        handleFallbackChatRequest();
      }
    } else {
      handleFallbackChatRequest();
    }
  };
  
  const handleFallbackChatRequest = () => {
    // Fallback to AI assistant if we can't find similar movies by API
    const chatIframe = document.querySelector('iframe[name="chat-iframe"]') as HTMLIFrameElement;
    if (chatIframe?.contentWindow) {
      chatIframe.contentWindow.postMessage({ type: 'OPEN_CHAT' }, '*');
      setTimeout(() => {
        const message = `Порекомендуй похожие фильмы на "${title}". Для каждого фильма укажи краткое описание почему он похож. Пожалуйста, отвечай на русском языке.`;
        chatIframe.contentWindow.postMessage({ 
          type: 'SEND_MESSAGE',
          message
        }, '*');
      }, 500);
    } else {
      toast.error("Не удалось открыть чат с ассистентом");
    }
  };

  const handleStartWatching = () => {
    soundEffects.play("click");
    setShowPlayer(true);
    setShowTrailer(false); // Скрываем трейлер при начале просмотра фильма
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWatchTrailer = () => {
    soundEffects.play("click");
    setShowTrailer(true);
  };

  const handleShowAllohaInfo = () => {
    soundEffects.play("click");
    setShowAllohaInfo(true);
  };

  return (
    <div className="min-h-screen bg-background/95">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-6"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Назад</span>
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-4 sm:gap-6 lg:gap-8 items-start">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {showPlayer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full rounded-xl overflow-hidden shadow-2xl"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative rounded-xl overflow-hidden shadow-2xl"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            )}

            {/* Показываем трейлер только если showTrailer равно true И showPlayer равно false */}
            {showTrailer && !showPlayer && movieDetails?.trailer ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full rounded-xl overflow-hidden shadow-xl"
                style={{ paddingBottom: "56.25%" }}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Трейлер</h3>
                <iframe
                  src={movieDetails.trailer}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </motion.div>
            ) : null}

            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              {kinopoiskData?.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/10"
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Описание</h3>
                  <p className="leading-relaxed text-muted-foreground text-sm sm:text-base">
                    {kinopoiskData.description}
                  </p>
                </motion.div>
              )}

              {movieDetails?.trailer && !showTrailer && !showPlayer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/10 flex flex-col justify-between"
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Трейлер доступен</h3>
                  <p className="leading-relaxed text-muted-foreground text-sm sm:text-base mb-4">
                    Хотите посмотреть официальный трейлер к фильму "{title}"?
                  </p>
                  <Button 
                    onClick={handleWatchTrailer}
                    variant="default"
                    className="w-full flex items-center gap-2 justify-center"
                  >
                    <Play className="h-5 w-5" />
                    Смотреть трейлер
                  </Button>
                </motion.div>
              )}
              
              {/* Новый блок для расширенной информации из Alloha API */}
              {allohaDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                  className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/10"
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Дополнительная информация</h3>
                  
                  {allohaDetails.tagline && (
                    <div className="mb-3">
                      <span className="text-muted-foreground">Слоган: </span>
                      <span className="italic">"{allohaDetails.tagline}"</span>
                    </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {allohaDetails.original_name && (
                      <div className="flex items-start">
                        <span className="text-muted-foreground w-24 sm:w-36 flex-shrink-0">Оригинальное название:</span>
                        <span>{allohaDetails.original_name}</span>
                      </div>
                    )}
                    {allohaDetails.quality && (
                      <div className="flex items-start">
                        <span className="text-muted-foreground w-24 sm:w-36 flex-shrink-0">Качество:</span>
                        <span>{allohaDetails.quality}</span>
                      </div>
                    )}
                    {allohaDetails.translation && (
                      <div className="flex items-start">
                        <span className="text-muted-foreground w-24 sm:w-36 flex-shrink-0">Перевод:</span>
                        <span>{allohaDetails.translation}</span>
                      </div>
                    )}
                  </div>
                  
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="w-full">Подробнее</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>
                          Подробная информация о фильме
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {allohaDetails.original_name && (
                          <div>
                            <h4 className="font-medium mb-1">Оригинальное название</h4>
                            <p className="text-muted-foreground">{allohaDetails.original_name}</p>
                          </div>
                        )}
                        
                        {(allohaDetails.premiere || allohaDetails.premiere_ru) && (
                          <div>
                            <h4 className="font-medium mb-1">Даты премьер</h4>
                            {allohaDetails.premiere && (
                              <p className="text-muted-foreground">
                                <span className="inline-block w-32">Мировая:</span> {allohaDetails.premiere}
                              </p>
                            )}
                            {allohaDetails.premiere_ru && (
                              <p className="text-muted-foreground">
                                <span className="inline-block w-32">В России:</span> {allohaDetails.premiere_ru}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {allohaDetails.directors && (
                          <div>
                            <h4 className="font-medium mb-1">Режиссеры</h4>
                            <p className="text-muted-foreground">
                              {ensureArray(allohaDetails.directors).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {allohaDetails.producers && (
                          <div>
                            <h4 className="font-medium mb-1">Продюсеры</h4>
                            <p className="text-muted-foreground">
                              {ensureArray(allohaDetails.producers).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {allohaDetails.actors && (
                          <div>
                            <h4 className="font-medium mb-1">В ролях</h4>
                            <p className="text-muted-foreground">
                              {ensureArray(allohaDetails.actors).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {allohaDetails.time && (
                          <div>
                            <h4 className="font-medium mb-1">Длительность</h4>
                            <p className="text-muted-foreground">{allohaDetails.time}</p>
                          </div>
                        )}
                        
                        {allohaDetails.age_restrictions && (
                          <div>
                            <h4 className="font-medium mb-1">Возрастное ограничение</h4>
                            <p className="text-muted-foreground">{allohaDetails.age_restrictions}</p>
                          </div>
                        )}
                        
                        {allohaDetails.rating_mpaa && (
                          <div>
                            <h4 className="font-medium mb-1">Рейтинг MPAA</h4>
                            <p className="text-muted-foreground">{allohaDetails.rating_mpaa}</p>
                          </div>
                        )}
                        
                        {allohaDetails.quality && (
                          <div>
                            <h4 className="font-medium mb-1">Качество</h4>
                            <p className="text-muted-foreground">{allohaDetails.quality}</p>
                          </div>
                        )}
                        
                        {allohaDetails.translation && (
                          <div>
                            <h4 className="font-medium mb-1">Перевод</h4>
                            <p className="text-muted-foreground">{allohaDetails.translation}</p>
                          </div>
                        )}
                        
                        {allohaDetails.description && (
                          <div>
                            <h4 className="font-medium mb-1">Описание</h4>
                            <p className="text-muted-foreground">{allohaDetails.description}</p>
                          </div>
                        )}
                      </div>
                      <DrawerFooter>
                        <DrawerClose>
                          <Button variant="outline" className="w-full">Закрыть</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </motion.div>
              )}
            </div>

            {movieStills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="space-y-4"
              >
                <h3 className="text-lg sm:text-xl font-semibold">Кадры из фильма</h3>
                <div className="relative -mx-4 sm:mx-0">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                      skipSnaps: false,
                      containScroll: "trimSnaps",
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
                      {movieStills.map((still, index) => (
                        <CarouselItem 
                          key={index} 
                          className="pl-1 sm:pl-2 md:pl-4 basis-[85%] sm:basis-[45%] md:basis-[40%] lg:basis-[30%]"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              duration: 0.4,
                              delay: index * 0.1,
                              ease: "easeOut"
                            }}
                            className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden group"
                          >
                            <img
                              src={still.imageUrl}
                              alt={`Кадр ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </motion.div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="hidden sm:block">
                      <CarouselPrevious className="-left-12 sm:-left-16 transition-transform duration-300 hover:scale-110" />
                      <CarouselNext className="-right-12 sm:-right-16 transition-transform duration-300 hover:scale-110" />
                    </div>
                  </Carousel>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:sticky lg:top-6 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                {title}
              </h1>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                <Button
                  size="lg"
                  className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                  onClick={handleStartWatching}
                  disabled={showPlayer}
                >
                  <Play className="h-5 w-5" />
                  {showPlayer ? "Воспроизводится" : "Смотреть"}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 transition-transform duration-300 hover:scale-110"
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 transition-colors duration-300 ${isLiked ? "fill-primary text-primary" : ""}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 transition-transform duration-300 hover:scale-110"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  className="sm:flex-1 flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                  onClick={handleFindSimilar}
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Похожие фильмы</span>
                </Button>
              </div>
            </motion.div>

            {/* Дополнительная информация из Alloha API */}
            {allohaDetails && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/10"
              >
                <div className="flex flex-col space-y-3">
                  {allohaDetails.rating_kp && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <span className="font-medium">{allohaDetails.rating_kp.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm ml-1">КиноПоиск</span>
                      </div>
                    </div>
                  )}
                  
                  {allohaDetails.rating_imdb && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <span className="font-medium">{allohaDetails.rating_imdb.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm ml-1">IMDb</span>
                      </div>
                    </div>
                  )}
                  
                  {allohaDetails.year && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span>{allohaDetails.year} год</span>
                    </div>
                  )}
                  
                  {allohaDetails.country && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <span>{allohaDetails.country}</span>
                    </div>
                  )}
                  
                  {allohaDetails.genre && (
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <span>{allohaDetails.genre}</span>
                    </div>
                  )}
                  
                  {allohaDetails.age_restrictions && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {allohaDetails.age_restrictions}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {kinopoiskData && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/10"
                >
                  <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-4">
                    <Star className="text-yellow-500" />
                    Рейтинги
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-background/50 rounded-lg transition-transform duration-300 hover:scale-105">
                      <div className="text-sm text-muted-foreground">КиноПоиск</div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                        {kinopoiskData.rating.kp.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-background/50 rounded-lg transition-transform duration-300 hover:scale-105">
                      <div className="text-sm text-muted-foreground">IMDb</div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                        {kinopoiskData.rating.imdb.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  className="bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/10"
                >
                  <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-4">
                    <Clock className="text-primary" />
                    Детали
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 group">
                      <Globe className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm sm:text-base">
                        {kinopoiskData.countries.map(c => c.name).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 group">
                      <Award className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm sm:text-base">
                        {kinopoiskData.genres.map(g => g.name).join(", ")}
                      </span>
                    </div>
                    {kinopoiskData.movieLength && (
                      <div className="flex items-center gap-2 group">
                        <Clock className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm sm:text-base">{kinopoiskData.movieLength} мин.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {showVPNAd && <VPNAdvertisement onComplete={() => setShowVPNAd(false)} />}
    </div>
  );
}
