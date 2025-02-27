
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { soundEffects } from "@/utils/soundEffects";
import { MovieCardProps } from "./types";
import { MovieActions } from "./MovieActions";
import { MovieOverlay } from "./MovieOverlay";
import { useMovieLike } from "./use-movie-like";

export function MovieCard({ title, image, link, className }: MovieCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isLiked, isLoading, handleLike } = useMovieLike(title, image, link);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      soundEffects.play("click");
      navigate(`/movie/${encodeURIComponent(title)}`, {
        state: { title, image, iframeUrl: link }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error("Произошла ошибка при переходе к фильму");
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      soundEffects.play("click");
      const shareUrl = `${window.location.origin}/movie/${encodeURIComponent(title)}`;
      
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
    } catch (error) {
      console.error('Share error:', error);
      toast.error("Произошла ошибка при попытке поделиться");
    }
  };

  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <motion.div
        className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary/30"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.img
          src={image || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-cover"
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
        
        <MovieActions
          isHovered={isHovered}
          isLiked={isLiked}
          isLoading={isLoading}
          onLike={handleLike}
          onShare={handleShare}
        />
        
        <MovieOverlay
          title={title}
          onClick={handleClick}
        />
      </motion.div>
      <motion.h3
        className="font-bold text-lg tracking-wide truncate text-foreground"
        whileHover={{ color: 'hsl(var(--primary))' }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>
    </div>
  );
}
