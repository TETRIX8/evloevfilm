import { cn } from "@/lib/utils";
import { Heart, Share2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { useState } from "react";

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function MovieCard({ title, image, link, className }: MovieCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/movie/${encodeURIComponent(title)}`, {
      state: { title, iframeUrl: link }
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
    if (!isLiked) {
      savedMovies.push({ title, image, link, savedAt: new Date().toISOString() });
      toast("Фильм добавлен в сохраненные");
    } else {
      const index = savedMovies.findIndex((movie: any) => movie.title === title);
      if (index > -1) savedMovies.splice(index, 1);
      toast("Фильм удален из сохраненных");
    }
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.origin + `/movie/${encodeURIComponent(title)}`
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.origin + `/movie/${encodeURIComponent(title)}`);
      toast("Ссылка скопирована в буфер обмена");
    }
  };

  return (
    <div className={cn(
      "group relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary/30 transition-all duration-300 hover:scale-105",
      className
    )}>
      <img
        src={image || "/placeholder.svg"}
        alt={title}
        className="h-full w-full object-cover"
        onClick={handleClick}
      />
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked ? "fill-primary text-primary" : "")} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleClick}>
        <div className="absolute bottom-0 p-4 w-full">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          <div className="mt-2 flex items-center gap-2 text-primary">
            <Play className="h-4 w-4" />
            <span className="text-sm">Смотреть</span>
          </div>
        </div>
      </div>
    </div>
  );
}