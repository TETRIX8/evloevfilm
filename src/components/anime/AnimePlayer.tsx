import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  Volume2, 
  Subtitles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { KodikAnimeItem } from "@/services/kodik-api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AnimePlayerProps {
  anime: KodikAnimeItem;
}

export function AnimePlayer({ anime }: AnimePlayerProps) {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState<string>("1");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("1");
  const [currentUrl, setCurrentUrl] = useState<string>(anime.link);
  const [showDescription, setShowDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set default season and episode
    if (anime.seasons) {
      const seasons = Object.keys(anime.seasons);
      if (seasons.length > 0) {
        const firstSeason = seasons[0];
        setSelectedSeason(firstSeason);
        
        const episodes = Object.keys(anime.seasons[firstSeason].episodes);
        if (episodes.length > 0) {
          const firstEpisode = episodes[0];
          setSelectedEpisode(firstEpisode);
          setCurrentUrl(anime.seasons[firstSeason].episodes[firstEpisode].link);
        }
      }
    }
  }, [anime]);

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    const episodes = Object.keys(anime.seasons![season].episodes);
    if (episodes.length > 0) {
      const firstEpisode = episodes[0];
      setSelectedEpisode(firstEpisode);
      setCurrentUrl(anime.seasons![season].episodes[firstEpisode].link);
      setIsLoading(true);
      toast.success(`Переключено на сезон ${season}`);
    }
  };

  const handleEpisodeChange = (episode: string) => {
    setSelectedEpisode(episode);
    const episodeUrl = anime.seasons![selectedSeason].episodes[episode].link;
    setCurrentUrl(episodeUrl);
    setIsLoading(true);
    toast.success(`Переключено на серию ${episode}`);
  };

  const posterUrl = anime.material_data?.poster_url || anime.material_data?.anime_poster_url || '/placeholder.svg';
  const rating = anime.material_data?.shikimori_rating;
  const genres = anime.material_data?.anime_genres || anime.material_data?.all_genres || [];
  
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
              onClick={() => navigate('/anime')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к аниме
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold truncate">{anime.title}</h1>
              {anime.title_orig && (
                <p className="text-sm text-muted-foreground truncate">{anime.title_orig}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Player */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3 space-y-4"
          >
            <Card className="overflow-hidden bg-black">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <iframe
                    src={currentUrl}
                    className="w-full h-full"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                    title={`${anime.title} - Сезон ${selectedSeason}, Серия ${selectedEpisode}`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Episode Controls */}
            {anime.seasons && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Управление сериями
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Season Selector */}
                  {Object.keys(anime.seasons).length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Сезоны</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(anime.seasons).map((season) => (
                          <Button
                            key={season}
                            variant={selectedSeason === season ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSeasonChange(season)}
                            className="min-w-[60px]"
                          >
                            Сезон {season}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Episode Selector */}
                  {anime.seasons[selectedSeason] && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Серии (Сезон {selectedSeason})
                      </h4>
                      <ScrollArea className="h-24">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(anime.seasons[selectedSeason].episodes).map(([episodeNum, episode]) => (
                            <Button
                              key={episodeNum}
                              variant={selectedEpisode === episodeNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleEpisodeChange(episodeNum)}
                              className="min-w-[50px] text-xs"
                              title={episode.title || `Серия ${episodeNum}`}
                            >
                              {episodeNum}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Translation Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {anime.translation.is_voice ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <Subtitles className="h-4 w-4" />
                    )}
                    <span>{anime.translation.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {anime.translation.type === "voice" ? "Озвучка" : "Субтитры"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Poster and Info */}
            <Card>
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

                <div className="space-y-3">
                  <h3 className="font-bold text-lg">{anime.title}</h3>
                  
                  {anime.title_orig && (
                    <p className="text-sm text-muted-foreground">{anime.title_orig}</p>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    {rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">Shikimori</span>
                      </div>
                    )}
                    
                    {anime.year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{anime.year} год</span>
                      </div>
                    )}

                    {anime.material_data?.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{anime.material_data.duration} мин/серия</span>
                      </div>
                    )}

                    {anime.episodes_count && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{anime.episodes_count} серий</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Жанры</h4>
                      <div className="flex flex-wrap gap-1">
                        {genres.map((genre, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {anime.material_data?.anime_status && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Статус</h4>
                      <Badge 
                        variant={anime.material_data.anime_status === 'released' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {anime.material_data.anime_status === 'released' ? 'Завершен' : 
                         anime.material_data.anime_status === 'ongoing' ? 'Выходит' : 'Анонс'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {anime.material_data?.description && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Описание</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDescription(!showDescription)}
                    >
                      {showDescription ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {showDescription && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {anime.material_data.description}
                        </p>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}