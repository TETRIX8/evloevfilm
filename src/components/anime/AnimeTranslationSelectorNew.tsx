import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Volume2, 
  Subtitles, 
  Star, 
  Clock, 
  Eye,
  ChevronRight,
  Users,
  Calendar
} from "lucide-react";
import { 
  getAvailableTranslations, 
  getAnimeEpisodes, 
  AnimeSearchItem,
  AnimeVideo 
} from "@/services/anitype-api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AnimeTranslationSelectorNewProps {
  anime: AnimeSearchItem;
}

export function AnimeTranslationSelectorNew({ anime }: AnimeTranslationSelectorNewProps) {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState<{
    id: number;
    title: string;
    type: "voice" | "subtitles";
  }[]>([]);
  const [episodes, setEpisodes] = useState<AnimeVideo[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  useEffect(() => {
    loadTranslationsAndEpisodes();
  }, [anime.id]);

  const loadTranslationsAndEpisodes = async () => {
    setIsLoading(true);
    try {
      // Пытаемся получить переводы через Kodik API используя shikimori_id если есть
      const shikimoriId = anime.id; // В новом API это может быть разное
      
      const [translationsData, episodesData] = await Promise.all([
        getAvailableTranslations(shikimoriId),
        getAnimeEpisodes(anime.id)
      ]);
      
      setTranslations(translationsData);
      setEpisodes(episodesData);
      
      // Автоматически выбираем первый перевод если есть
      if (translationsData.length > 0) {
        setSelectedTranslation(translationsData[0].id);
      }
      
      if (translationsData.length === 0 && episodesData.length === 0) {
        toast.warning("Видео для данного аниме пока не найдено");
      }
    } catch (error) {
      console.error("Error loading translations and episodes:", error);
      toast.error("Ошибка при загрузке данных");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchEpisode = (episode: AnimeVideo) => {
    if (!selectedTranslation && translations.length > 0) {
      toast.error("Выберите озвучку для просмотра");
      return;
    }

    // Если есть прямая ссылка на Kodik
    if (episode.links.kodik) {
      const playerUrl = episode.links.kodik.startsWith('//') 
        ? `https:${episode.links.kodik}` 
        : episode.links.kodik;
      
      navigate(`/anime/anitype/${anime.id}/watch`, {
        state: {
          anime,
          episode: episode.episode,
          season: episode.season,
          playerUrl,
          translation: translations.find(t => t.id === selectedTranslation)
        }
      });
    } else {
      // Fallback к обычному плееру
      navigate(`/anime/anitype/${anime.id}/watch/${episode.episode}`, {
        state: {
          anime,
          episode: episode.episode,
          season: episode.season,
          translationId: selectedTranslation
        }
      });
    }
  };

  const getTranslationIcon = (type: "voice" | "subtitles") => {
    return type === "voice" ? <Volume2 className="h-4 w-4" /> : <Subtitles className="h-4 w-4" />;
  };

  const getTranslationLabel = (type: "voice" | "subtitles") => {
    return type === "voice" ? "Озвучка" : "Субтитры";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Anime Info Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {anime.poster && (
              <div className="w-32 h-48 flex-shrink-0">
                <img
                  src={anime.poster}
                  alt={anime.titles.russian || anime.titles.original}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-3 text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {anime.titles.russian || anime.titles.original}
              </h1>
              
              {anime.titles.original && (anime.titles.russian || anime.titles.original) !== anime.titles.original && (
                <p className="text-lg text-muted-foreground">
                  {anime.titles.original}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {anime.score > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    {anime.score.toFixed(1)}
                  </div>
                )}
                
                {anime.episodes > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {anime.episodes} эп.
                  </div>
                )}
                
                {anime.episode_duration > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {anime.episode_duration} мин
                  </div>
                )}
                
                {anime.aired_on && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(anime.aired_on).getFullYear()}
                  </div>
                )}
              </div>
              
              {anime.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 max-w-2xl">
                  {anime.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Translation Selection */}
          {translations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Выбор озвучки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {translations.map((translation) => (
                    <motion.div
                      key={translation.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedTranslation === translation.id ? "default" : "outline"}
                        className="w-full justify-start gap-3 h-auto p-4"
                        onClick={() => setSelectedTranslation(translation.id)}
                      >
                        {getTranslationIcon(translation.type)}
                        <div className="text-left">
                          <div className="font-medium">{translation.title}</div>
                          <div className="text-xs opacity-70">
                            {getTranslationLabel(translation.type)}
                          </div>
                        </div>
                        {selectedTranslation === translation.id && (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Episodes List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={translations.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Эпизоды
                  {episodes.length > 0 && (
                    <Badge variant="secondary">{episodes.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {episodes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎌</div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Эпизоды не найдены
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Видео для данного аниме пока недоступно
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {episodes.map((episode) => (
                        <motion.div
                          key={`${episode.season}-${episode.episode}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * episode.episode }}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {episode.picture && (
                                    <div className="w-16 h-12 flex-shrink-0">
                                      <img
                                        src={episode.picture}
                                        alt={`Эпизод ${episode.episode}`}
                                        className="w-full h-full object-cover rounded"
                                      />
                                    </div>
                                  )}
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">
                                        Эпизод {episode.episode}
                                        {episode.season > 1 && (
                                          <span className="text-muted-foreground">
                                            {" "}(Сезон {episode.season})
                                          </span>
                                        )}
                                      </h4>
                                      
                                      {episode.has_uhd && (
                                        <Badge variant="secondary" className="text-xs">
                                          UHD
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      {episode.translation && (
                                        <div className="flex items-center gap-1">
                                          {getTranslationIcon(episode.translation.title.toLowerCase().includes('субтитры') ? 'subtitles' : 'voice')}
                                          {episode.translation.title}
                                        </div>
                                      )}
                                      
                                      {episode.watches > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Eye className="h-3 w-3" />
                                          {episode.watches.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  size="sm"
                                  onClick={() => handleWatchEpisode(episode)}
                                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                                >
                                  <Play className="h-4 w-4 mr-2 fill-current" />
                                  Смотреть
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* No content message */}
        {translations.length === 0 && episodes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-12"
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Контент недоступен
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  К сожалению, для данного аниме пока нет доступных переводов или эпизодов.
                  Попробуйте позже или выберите другое аниме.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/anime')}
                >
                  Вернуться к аниме
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}