
import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "@/services/api";
import { toast } from "sonner";

interface Movie {
  title: string;
  image: string;
  link: string;
}

export function PopularMoviesSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  // Fetch popular movies from the API
  const { data: popularMovies, error } = useQuery({
    queryKey: ["popular-movies"],
    queryFn: () => fetchMovies('films', '', { sort: '-views', limit: 10 }),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });
  
  // Show error toast if query fails
  if (error) {
    toast.error("Не удалось загрузить популярные фильмы. Пожалуйста, попробуйте позже.");
  }
  
  // Auto-advance the slideshow every 5 seconds
  useEffect(() => {
    if (!popularMovies || popularMovies.length === 0) return;
    
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % popularMovies.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [popularMovies, isHovered]);
  
  // If no movies or still loading
  if (!popularMovies || popularMovies.length === 0) {
    return null;
  }
  
  const currentMovie = popularMovies[currentIndex];
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? popularMovies.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % popularMovies.length
    );
  };
  
  const handleMovieClick = () => {
    navigate(`/movie/${encodeURIComponent(currentMovie.title)}`, {
      state: { title: currentMovie.title, image: currentMovie.image, iframeUrl: currentMovie.link }
    });
  };
  
  return (
    <section 
      className="relative rounded-xl overflow-hidden h-[400px] mb-12 shadow-xl"
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent">
            <div className="flex flex-col justify-end h-full p-8 md:p-12 max-w-2xl">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-5xl font-bold mb-4 text-primary drop-shadow-lg"
              >
                {currentMovie.title}
              </motion.h2>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex space-x-4 mb-6"
              >
                <Button 
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={handleMovieClick}
                >
                  <Play className="h-4 w-4" />
                  Смотреть
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {popularMovies.map((_, index) => (
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
