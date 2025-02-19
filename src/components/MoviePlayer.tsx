import { ArrowLeft, Heart, Share2, Search, Star, Clock, Globe, Award, Play } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { soundEffects } from "../utils/soundEffects";
import { addToWatchHistory, updateWatchProgress } from "../utils/watchHistory";
import { fetchMovieDetails } from "@/services/api";
import { VPNAdvertisement } from "./VPNAdvertisement";
import { fetchKinopoiskMovie, type KinopoiskMovie } from "@/services/kinopoisk";
import { motion, AnimatePresence } from "framer-motion";

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
        const kinopoiskDetails = await fetchKinopoiskMovie(details.kinopoisk_id);
        setKinopoiskData(kinopoiskDetails);
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

  const handleFindSimilar = () => {
    soundEffects.play("click");
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-8">
            {showPlayer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={imageUrl}
                alt={title}
                className="w-full rounded-xl shadow-2xl aspect-[2/3] object-cover"
              />
            )}

            {kinopoiskData?.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10"
              >
                <h3 className="text-xl font-semibold mb-4">Описание</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {kinopoiskData.description}
                </p>
              </motion.div>
            )}
          </div>

          <div className="lg:sticky lg:top-6 space-y-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-4"
              >
                {title}
              </motion.h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  size="lg"
                  className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                  onClick={handleStartWatching}
                  disabled={showPlayer}
                >
                  <Play className="h-5 w-5" />
                  {showPlayer ? "Воспроизводится" : "Смотреть"}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12"
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-primary text-primary" : ""}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  className="sm:flex-1 flex items-center gap-2"
                  onClick={handleFindSimilar}
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Похожие фильмы</span>
                </Button>
              </div>
            </div>

            {kinopoiskData && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10"
                >
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Star className="text-yellow-500" />
                    Рейтинги
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">КиноПоиск</div>
                      <div className="text-2xl font-bold text-yellow-500">
                        {kinopoiskData.rating.kp.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">IMDb</div>
                      <div className="text-2xl font-bold text-yellow-500">
                        {kinopoiskData.rating.imdb.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10"
                >
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Clock className="text-primary" />
                    Детали
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {kinopoiskData.countries.map(c => c.name).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {kinopoiskData.genres.map(g => g.name).join(", ")}
                      </span>
                    </div>
                    {kinopoiskData.movieLength && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{kinopoiskData.movieLength} мин.</span>
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
