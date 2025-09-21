import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Settings, 
  Maximize, 
  Volume2, 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Star,
  Clock,
  Users,
  Calendar,
  ExternalLink
} from "lucide-react";
import { 
  getEpisodePlayerUrl,
  getAnimeEpisodes,
  AnimeSearchItem,
  AnimeVideo 
} from "@/services/anitype-api";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface AnimePlayerNewProps {
  anime: AnimeSearchItem;
  episode?: number;
  season?: number;
  playerUrl?: string;
  translationId?: number;
}

export function AnimePlayerNew({ 
  anime, 
  episode = 1, 
  season = 1, 
  playerUrl,
  translationId 
}: AnimePlayerNewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [currentPlayerUrl, setCurrentPlayerUrl] = useState<string>(playerUrl || '');
  const [episodes, setEpisodes] = useState<AnimeVideo[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [isLoading, setIsLoading] = useState(!playerUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Получаем данные из location.state если есть
  const stateData = location.state as {
    anime?: AnimeSearchItem;
    episode?: number;
    season?: number;
    playerUrl?: string;
    translationId?: number;
    translation?: { id: number; title: string; type: string; };
  } | null;

  useEffect(() => {
    if (stateData?.playerUrl) {
      setCurrentPlayerUrl(stateData.playerUrl);
      setIsLoading(false);
    } else {
      loadPlayerUrl();
    }
    loadEpisodes();
  }, [anime.id, currentEpisode, currentSeason, translationId]);

  const loadPlayerUrl = async () => {
    if (currentPlayerUrl) return;
    
    setIsLoading(true);
    try {
      const url = await getEpisodePlayerUrl(
        anime.id, // Используем ID из нового API
        currentEpisode,
        currentSeason,
        translationId
      );
      
      if (url) {
        setCurrentPlayerUrl(url);
      } else {
        toast.error("Не удалось загрузить плеер для этого эпизода");
      }
    } catch (error) {
      console.error("Error loading player URL:", error);
      toast.error("Ошибка при загрузке плеера");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEpisodes = async () => {
    try {
      const episodesData = await getAnimeEpisodes(anime.id);
      setEpisodes(episodesData);
    } catch (error) {
      console.error("Error loading episodes:", error);
    }
  };

  const handleEpisodeChange = (newEpisode: number, newSeason: number = 1) => {
    setCurrentEpisode(newEpisode);
    setCurrentSeason(newSeason);
    setCurrentPlayerUrl('');
    setIsLoading(true);
    
    // Обновляем URL без перезагрузки страницы
    const newPath = `/anime/anitype/${anime.id}/watch/${newEpisode}`;
    window.history.replaceState(null, '', newPath);
  };

  const handleGoBack = () => {
    navigate(`/anime/anitype/${anime.id}/select`, {
      state: { anime }
    });
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        iframeRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (currentEpisode > 1) {
      handleEpisodeChange(currentEpisode - 1, currentSeason);
    }
  };

  const handleNextEpisode = () => {
    const maxEpisode = episodes.length > 0 ? episodes.length : anime.episodes;
    if (currentEpisode < maxEpisode) {
      handleEpisodeChange(currentEpisode + 1, currentSeason);
    }
  };

  const openInNewTab = () => {
    if (currentPlayerUrl) {
      window.open(currentPlayerUrl, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white"
    >
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="space-y-1">
              <h1 className="font-semibold text-foreground">
                {anime.titles.russian || anime.titles.original}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Эпизод {currentEpisode}</span>
                {currentSeason > 1 && <span>• Сезон {currentSeason}</span>}
                {stateData?.translation && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      {stateData.translation.title}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {anime.score > 0 && (
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                {anime.score.toFixed(1)}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="text-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Player */}
          <div className="xl:col-span-3">
            <Card className="bg-black border-gray-800">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-muted-foreground">Загрузка плеера...</p>
                      </div>
                    </div>
                  ) : currentPlayerUrl ? (
                    <iframe
                      ref={iframeRef}
                      src={currentPlayerUrl}
                      title={`${anime.titles.russian || anime.titles.original} - Эпизод ${currentEpisode}`}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      allow="autoplay; encrypted-media; picture-in-picture"
                      sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">📺</div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Плеер недоступен</h3>
                          <p className="text-muted-foreground mb-4">
                            Не удалось загрузить видео для этого эпизода
                          </p>
                          <Button onClick={handleGoBack} variant="outline">
                            Выбрать другой эпизод
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Player Controls Overlay */}
                  {!isLoading && currentPlayerUrl && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handlePreviousEpisode}
                          disabled={currentEpisode <= 1}
                          className="text-white hover:text-primary"
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleNextEpisode}
                          disabled={currentEpisode >= (episodes.length || anime.episodes)}
                          className="text-white hover:text-primary"
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleFullscreen}
                          className="text-white hover:text-primary"
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Episode Navigation */}
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousEpisode}
                disabled={currentEpisode <= 1}
                className="flex-1 mr-2"
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Предыдущий эпизод
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNextEpisode}
                disabled={currentEpisode >= (episodes.length || anime.episodes)}
                className="flex-1 ml-2"
              >
                Следующий эпизод
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar with episodes and info */}
          <div className="space-y-6">
            {/* Anime Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {anime.poster && (
                  <div className="w-full h-48">
                    <img
                      src={anime.poster}
                      alt={anime.titles.russian || anime.titles.original}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{anime.episodes} эпизодов</span>
                  </div>
                  
                  {anime.episode_duration > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{anime.episode_duration} минут</span>
                    </div>
                  )}
                  
                  {anime.aired_on && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(anime.aired_on).getFullYear()}</span>
                    </div>
                  )}
                </div>

                {anime.description && (
                  <div>
                    <h4 className="font-medium mb-2">Описание</h4>
                    <p className="text-sm text-muted-foreground">
                      {anime.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Episodes List */}
            {episodes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Эпизоды</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {episodes.map((ep) => (
                        <Button
                          key={`${ep.season}-${ep.episode}`}
                          variant={ep.episode === currentEpisode ? "default" : "ghost"}
                          className="w-full justify-start h-auto p-3"
                          onClick={() => handleEpisodeChange(ep.episode, ep.season)}
                        >
                          <div className="text-left">
                            <div className="font-medium">Эпизод {ep.episode}</div>
                            {ep.translation && (
                              <div className="text-xs opacity-70">
                                {ep.translation.title}
                              </div>
                            )}
                          </div>
                          
                          {ep.episode === currentEpisode && (
                            <Play className="h-4 w-4 ml-auto" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}