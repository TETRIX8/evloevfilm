import { motion } from "framer-motion";
import { Star, Play, Clock, Calendar, Users, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimeSearchItem } from "@/services/anitype-api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface AnimeCardNewProps {
  anime: AnimeSearchItem;
  index?: number;
}

export function AnimeCardNew({ anime, index = 0 }: AnimeCardNewProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleWatch = () => {
    navigate(`/anime/anitype/${anime.id}/select`, {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released':
        return { label: 'Завершён', variant: 'default' as const };
      case 'ongoing':
        return { label: 'Выходит', variant: 'secondary' as const };
      case 'anons':
        return { label: 'Анонс', variant: 'outline' as const };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'tv':
        return 'ТВ Сериал';
      case 'movie':
        return 'Фильм';
      case 'ova':
        return 'OVA';
      case 'special':
        return 'Спецвыпуск';
      default:
        return kind.toUpperCase();
    }
  };

  const statusBadge = getStatusBadge(anime.status);

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
          {!imageError && anime.poster ? (
            <img
              src={anime.poster}
              alt={anime.titles.russian || anime.titles.original}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center p-4">
                <div className="text-6xl mb-2">🎌</div>
                <p className="text-sm text-muted-foreground font-medium">
                  {anime.titles.russian || anime.titles.original}
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

          {/* Score Badge */}
          {anime.score > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white border-yellow-400/50">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {anime.score.toFixed(1)}
              </Badge>
            </div>
          )}

          {/* Kind Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-black/60 text-white border-green-400/50">
              {getKindLabel(anime.kind)}
            </Badge>
          </div>

          {/* Episode Count */}
          {anime.episodes > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white">
                <Users className="h-3 w-3 mr-1" />
                {anime.episodes_aired > 0 && anime.episodes_aired !== anime.episodes 
                  ? `${anime.episodes_aired}/${anime.episodes}` 
                  : anime.episodes} эп.
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {anime.titles.russian || anime.titles.original}
            </h3>
            {anime.titles.original && anime.titles.original !== (anime.titles.russian || anime.titles.original) && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {anime.titles.original}
              </p>
            )}
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {anime.aired_on && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(anime.aired_on).getFullYear()}
              </div>
            )}
            {anime.episode_duration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {anime.episode_duration} мин
              </div>
            )}
          </div>

          {/* Description */}
          {anime.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {anime.description}
            </p>
          )}

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((genre, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                >
                  {genre.title}
                </Badge>
              ))}
              {anime.genres.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{anime.genres.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Status and Season */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Badge 
              variant={statusBadge.variant}
              className="text-xs"
            >
              {statusBadge.label}
            </Badge>
            
            {anime.season && (
              <Badge variant="outline" className="text-xs">
                {anime.season.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Next Episode Info */}
          {anime.next_episode_at && anime.status === 'ongoing' && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Следующий эпизод: {new Date(anime.next_episode_at).toLocaleDateString('ru-RU')}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}