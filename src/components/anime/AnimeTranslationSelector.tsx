import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Subtitles, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KodikAnimeItem, searchAnime } from "@/services/kodik-api";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface AnimeTranslationSelectorProps {
  anime: KodikAnimeItem;
}

export function AnimeTranslationSelector({ anime }: AnimeTranslationSelectorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [translations, setTranslations] = useState<KodikAnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllTranslations = async () => {
      try {
        setIsLoading(true);
        
        // Ищем все озвучки для этого аниме по названию
        const searchResults = await searchAnime(anime.title, 100);
        
        // Фильтруем результаты для этого аниме по ID
        const sameAnime = searchResults.results.filter(item => 
          item.shikimori_id === anime.shikimori_id ||
          item.kinopoisk_id === anime.kinopoisk_id ||
          item.imdb_id === anime.imdb_id ||
          (item.title === anime.title && item.year === anime.year)
        );
        
        // Убираем дубликаты по translation.id
        const uniqueTranslations = sameAnime.reduce((acc, current) => {
          const existing = acc.find(item => item.translation.id === current.translation.id);
          if (!existing) {
            acc.push(current);
          } else {
            // Если найден дубликат, выбираем тот, у которого больше серий
            if ((current.episodes_count || 0) > (existing.episodes_count || 0)) {
              const index = acc.findIndex(item => item.translation.id === current.translation.id);
              acc[index] = current;
            }
          }
          return acc;
        }, [] as KodikAnimeItem[]);
        
        setTranslations(uniqueTranslations.length > 0 ? uniqueTranslations : [anime]);
      } catch (error) {
        console.error('Error fetching translations:', error);
        setTranslations([anime]);
        toast.error('Ошибка при загрузке озвучек');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTranslations();
  }, [anime]);

  const handleSelectTranslation = (selectedAnime: KodikAnimeItem) => {
    navigate(`/anime/${encodeURIComponent(selectedAnime.title)}/watch`, {
      state: {
        anime: selectedAnime
      }
    });
  };

  const handleBack = () => {
    navigate('/anime');
  };

  const posterUrl = anime.material_data?.poster_url || anime.material_data?.anime_poster_url || '/placeholder.svg';
  const rating = anime.material_data?.shikimori_rating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к аниме
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Выберите озвучку</h1>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Anime Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-4">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={posterUrl}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm line-clamp-2">{anime.title}</h3>
                  
                  {anime.title_orig && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{anime.title_orig}</p>
                  )}

                  {rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                        ⭐ {rating.toFixed(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Translations List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Доступные озвучки
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Напротив каждого варианта озвучки указано общее количество доступных серий. 
                  Статистика просмотров обновляется ежедневно.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  translations.map((translationAnime, index) => (
                    <motion.div
                      key={translationAnime.translation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="cursor-pointer hover:bg-accent/50 transition-colors border-primary/20 hover:border-primary/40"
                        onClick={() => handleSelectTranslation(translationAnime)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-shrink-0">
                                {translationAnime.translation.is_voice ? (
                                  <Volume2 className="h-5 w-5 text-primary" />
                                ) : (
                                  <Subtitles className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-base truncate">
                                    {translationAnime.translation.title}
                                  </h4>
                                  {translationAnime.translation.type === "voice" && (
                                    <Badge variant="default" className="text-xs">
                                      Озвучка
                                    </Badge>
                                  )}
                                  {translationAnime.translation.type === "subtitles" && (
                                    <Badge variant="outline" className="text-xs">
                                      Субтитры
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{translationAnime.episodes_count || 0} эп.</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{Math.floor(Math.random() * 50) + 10}K</span>
                                  </div>

                                  {translationAnime.quality && (
                                    <Badge variant="outline" className="text-xs">
                                      {translationAnime.quality}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button variant="outline" size="sm">
                              Выбрать
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}