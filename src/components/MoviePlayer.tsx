import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { soundEffects } from "../utils/soundEffects";
import { addToWatchHistory, updateWatchProgress } from "../utils/watchHistory";
import { fetchMovieDetails } from "@/services/api";

interface MoviePlayerProps {
  title: string;
  iframeUrl: string;
}

export function MoviePlayer({ title, iframeUrl }: MoviePlayerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLiked, setIsLiked] = useState(false);
  const imageUrl = location.state?.image || "/placeholder.svg";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [movieDetails, setMovieDetails] = useState<any>(null);

  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    const isSaved = savedMovies.some((movie: any) => movie.title === title);
    setIsLiked(isSaved);

    const fetchDetails = async () => {
      const details = await fetchMovieDetails(title);
      setMovieDetails(details);
    };

    fetchDetails();

    addToWatchHistory({
      title,
      image: imageUrl,
      link: iframeUrl
    });

    const interval = setInterval(() => {
      if (iframeRef.current) {
        const progress = Math.random();
        updateWatchProgress(title, progress);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [title, imageUrl, iframeUrl]);

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

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Назад</span>
          </button>
          
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10"
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6 animate-fade-in">{title}</h1>
        
        {movieDetails && (
          <div className="mb-4">
            {movieDetails.description && (
              <p className="text-sm mb-2">{movieDetails.description}</p>
            )}
            {movieDetails.year && (
              <p className="text-sm">Год: {movieDetails.year}</p>
            )}
            {movieDetails.rating && (
              <p className="text-sm">Рейтинг: {movieDetails.rating}</p>
            )}
            {movieDetails.genres && movieDetails.genres.length > 0 && (
              <p className="text-sm">Жанры: {movieDetails.genres.join(", ")}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 relative w-full max-w-[1200px] mx-auto px-4">
        <div className="relative w-full rounded-lg overflow-hidden shadow-2xl animate-scale-in" style={{ paddingBottom: "56.25%" }}>
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}