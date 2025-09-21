
import { motion } from "framer-motion";
import { Star, Play, Clock, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { KodikAnimeItem } from "@/services/kodik-api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface AnimeCardProps {
  anime: KodikAnimeItem;
  index?: number;
}

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleWatch = () => {
    navigate(`/anime/${encodeURIComponent(anime.title)}/select`, {
      state: {
        anime: anime
      }
    });
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

// Получаем список URL постеров/скриншотов и удаляем дубликаты
const getPosterUrls = () => {
  const sources = [
    anime.material_data?.poster_url,
    anime.material_data?.anime_poster_url,
    ...(anime.screenshots || [])
  ].filter(Boolean) as string[];

  // Уникальные значения, без пустых
  const unique = Array.from(new Set(sources));
  return unique.length > 0 ? unique : ['/placeholder.svg'];
};

const posterUrl = getPosterUrls();
const rating = anime.material_data?.shikimori_rating;
const genres = anime.material_data?.anime_genres || anime.material_data?.all_genres || [];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {!imageError ? (
            posterUrl && posterUrl.length > 1 ? (
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {posterUrl.map((url, idx) => (
                    <CarouselItem key={idx} className="p-0">
                      <img
                        src={url}
                        alt={`${anime.title} — постер ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImageError(true)}
                        loading="lazy"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
              </Carousel>
            ) : (
              <img
                src={Array.isArray(posterUrl) ? posterUrl[0] : posterUrl}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center p-4">
                <div className="text-6xl mb-2">🎌</div>
                <p className="text-sm text-muted-foreground font-medium">
                  {anime.title}
                </p>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Play Button Overlay */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <Button
              size="lg"
              onClick={handleWatch}
              className="rounded-full bg-primary/90 hover:bg-primary text-primary-foreground border-2 border-white/20 backdrop-blur-sm"
            >
              <Play className="h-6 w-6 mr-2 fill-current" />
              Смотреть
            </Button>
          </motion.div>

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white border-yellow-400/50">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
              </Badge>
            </div>
          )}

          {/* Quality Badge */}
          {anime.quality && (
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-black/60 text-white border-green-400/50">
                {anime.quality}
              </Badge>
            </div>
          )}

          {/* Episode Count */}
          {anime.episodes_count && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white">
                <Users className="h-3 w-3 mr-1" />
                {anime.episodes_count} эп.
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {anime.title}
            </h3>
            {anime.title_orig && anime.title_orig !== anime.title && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {anime.title_orig}
              </p>
            )}
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {anime.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {anime.year}
              </div>
            )}
            {anime.material_data?.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {anime.material_data.duration} мин
              </div>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 2).map((genre, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                >
                  {genre}
                </Badge>
              ))}
              {genres.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{genres.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Status */}
          {anime.material_data?.anime_status && (
            <div className="pt-2 border-t border-border/50">
              <Badge 
                variant={anime.material_data.anime_status === 'released' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {anime.material_data.anime_status === 'released' ? 'Завершен' : 
                 anime.material_data.anime_status === 'ongoing' ? 'Выходит' : 'Анонс'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
