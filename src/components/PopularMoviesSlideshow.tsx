
import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, Clock, Calendar, Star, Award, User, Film, Video } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies, fetchMovieDetails, MovieDetails } from "@/services/api";
import { fetchAllohaMovieDetails, AllohaMovieData } from "@/services/alloha-api";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Movie {
  title: string;
  image: string;
  link: string;
}

interface MovieWithDetails extends Movie {
  details?: MovieDetails | null;
  allohaDetails?: AllohaMovieData | null;
}

// Helper function to convert string or array to array
const ensureArray = (data: string | string[] | undefined): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data]; // If it's a string, wrap it in an array
};

export function PopularMoviesSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [moviesWithDetails, setMoviesWithDetails] = useState<MovieWithDetails[]>([]);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showMore, setShowMore] = useState<Record<number, boolean>>({});
  
  // Fetch popular movies from the API
  const { data: popularMovies, error } = useQuery({
    queryKey: ["popular-movies"],
    queryFn: () => fetchMovies('films', '', { sort: '-views', limit: 10 }),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });
  
  // Fetch details for each movie
  useEffect(() => {
    if (!popularMovies || popularMovies.length === 0) return;
    
    const fetchDetails = async () => {
      const moviesWithDetailsList: MovieWithDetails[] = [...popularMovies];
      
      for (let i = 0; i < popularMovies.length; i++) {
        try {
          const details = await fetchMovieDetails(popularMovies[i].title);
          moviesWithDetailsList[i] = {
            ...popularMovies[i],
            details
          };

          // If we have a KinoPoisk ID, fetch additional details from Alloha API
          if (details?.kinopoisk_id) {
            const allohaDetails = await fetchAllohaMovieDetails(details.kinopoisk_id);
            if (allohaDetails) {
              moviesWithDetailsList[i] = {
                ...moviesWithDetailsList[i],
                allohaDetails
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching details for ${popularMovies[i].title}:`, error);
        }
      }
      
      setMoviesWithDetails(moviesWithDetailsList);
    };
    
    fetchDetails();
  }, [popularMovies]);
  
  // Show error toast if query fails
  if (error) {
    toast.error("Не удалось загрузить популярные фильмы. Пожалуйста, попробуйте позже.");
  }
  
  // Auto-advance the slideshow every 5 seconds
  useEffect(() => {
    if (!moviesWithDetails || moviesWithDetails.length === 0) return;
    
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % moviesWithDetails.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [moviesWithDetails, isHovered]);
  
  // If no movies or still loading
  if (!moviesWithDetails || moviesWithDetails.length === 0) {
    return null;
  }
  
  const currentMovie = moviesWithDetails[currentIndex];
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? moviesWithDetails.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % moviesWithDetails.length
    );
  };
  
  const handleMovieClick = () => {
    navigate(`/movie/${encodeURIComponent(currentMovie.title)}`, {
      state: { title: currentMovie.title, image: currentMovie.image, iframeUrl: currentMovie.link }
    });
  };

  const toggleShowMore = () => {
    setShowMore(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };
  
  return (
    <section 
      className="relative rounded-xl overflow-hidden h-[500px] mb-12 shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img 
            src={currentMovie.image} 
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-transparent">
            <div className="flex flex-col justify-end h-full p-8 md:p-12 max-w-3xl">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-5xl font-bold mb-4 text-primary drop-shadow-lg"
              >
                {currentMovie.title}
              </motion.h2>

              {currentMovie.allohaDetails?.original_name && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="mb-3 text-xl text-muted-foreground italic"
                >
                  {currentMovie.allohaDetails.original_name}
                </motion.div>
              )}
              
              {/* Info badges row */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap items-center gap-2 mb-4"
              >
                {currentMovie.allohaDetails?.year || currentMovie.details?.year ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{currentMovie.allohaDetails?.year || currentMovie.details?.year}</span>
                  </Badge>
                ) : null}

                {currentMovie.allohaDetails?.time && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{currentMovie.allohaDetails.time}</span>
                  </Badge>
                )}

                {currentMovie.allohaDetails?.rating_kp && (
                  <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>КП {currentMovie.allohaDetails.rating_kp.toFixed(1)}</span>
                  </Badge>
                )}

                {currentMovie.allohaDetails?.rating_imdb && (
                  <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>IMDb {currentMovie.allohaDetails.rating_imdb.toFixed(1)}</span>
                  </Badge>
                )}

                {currentMovie.allohaDetails?.age_restrictions && (
                  <Badge variant="destructive">
                    {currentMovie.allohaDetails.age_restrictions}
                  </Badge>
                )}

                {currentMovie.allohaDetails?.quality && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    <span>{currentMovie.allohaDetails.quality}</span>
                  </Badge>
                )}
              </motion.div>

              {/* Genre badges */}
              {currentMovie.allohaDetails?.genre && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="flex flex-wrap gap-2 mb-4"
                >
                  {currentMovie.allohaDetails.genre.split(', ').map((genre, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/20 hover:bg-primary/30">
                      {genre}
                    </Badge>
                  ))}
                </motion.div>
              )}
              
              {/* Movie description */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-4 relative"
              >
                <p className={`text-sm md:text-base text-white/90 ${showMore[currentIndex] ? '' : 'line-clamp-3'}`}>
                  {currentMovie.allohaDetails?.description || currentMovie.details?.description || ""}
                </p>
                {(currentMovie.allohaDetails?.description?.length || currentMovie.details?.description?.length || 0) > 150 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); toggleShowMore(); }}
                    className="p-0 h-auto text-xs text-primary mt-1"
                  >
                    {showMore[currentIndex] ? "Свернуть" : "Показать больше"}
                  </Button>
                )}
              </motion.div>

              {/* Directors section */}
              {currentMovie.allohaDetails?.directors && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="flex items-center mb-2"
                >
                  <Film className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Режиссер:</span>
                  <span className="text-white/80">
                    {ensureArray(currentMovie.allohaDetails.directors).slice(0, 2).join(', ')}
                  </span>
                </motion.div>
              )}

              {/* Actors section */}
              {currentMovie.allohaDetails?.actors && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center mb-4"
                >
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">В ролях:</span>
                  <span className="text-white/80 truncate">
                    {ensureArray(currentMovie.allohaDetails.actors).slice(0, 3).join(', ')}
                    {ensureArray(currentMovie.allohaDetails.actors).length > 3 ? '...' : ''}
                  </span>
                </motion.div>
              )}

              {/* Tagline */}
              {currentMovie.allohaDetails?.tagline && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                  className="mb-4 italic text-sm text-white/70"
                >
                  «{currentMovie.allohaDetails.tagline}»
                </motion.div>
              )}
              
              {/* Action buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap gap-4 mt-2"
              >
                <Button 
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={handleMovieClick}
                >
                  <Play className="h-4 w-4" />
                  Смотреть
                </Button>
                
                {currentMovie.allohaDetails?.trailer && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => window.open(currentMovie.allohaDetails?.trailer, '_blank')}
                        >
                          <Video className="h-4 w-4" />
                          Трейлер
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Открыть трейлер</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {currentMovie.details?.kinopoisk_id && !currentMovie.allohaDetails?.trailer && (
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open(`https://www.kinopoisk.ru/film/${currentMovie.details?.kinopoisk_id}/`, '_blank')}
                  >
                    <Award className="h-4 w-4" />
                    КиноПоиск
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {moviesWithDetails.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-primary scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Arrow buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 h-10 w-10 rounded-full"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 h-10 w-10 rounded-full"
        onClick={handleNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </section>
  );
}
