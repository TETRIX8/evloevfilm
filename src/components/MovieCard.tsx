
import { cn } from "@/lib/utils";
import { Heart, Share2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundEffects } from "@/utils/soundEffects";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useFirebaseStorage } from "@/hooks/use-firebase-storage";

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
  type?: 'movie' | 'anime';
  year?: number;
  rating?: number;
  description?: string;
  id?: string;
}

export function MovieCard({ title, image, link, className, type = 'movie', year, rating, description, id }: MovieCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const previewVideo = previewVideoRef.current;
    if (!previewVideo) return;

    if (isHovered) {
      void previewVideo.play().catch(() => undefined);
      return;
    }

    previewVideo.pause();
    previewVideo.currentTime = 0;
  }, [isHovered]);
  
  const { user } = useFirebaseAuth();
  const { savedItems, isSaved, addToSaved, removeFromSaved, addToHistory } = useFirebaseStorage();

  const isLiked = isSaved(link);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      soundEffects.play("click");
      
      // Добавляем в историю просмотра
      if (user) {
        await addToHistory({
          title,
          type,
          poster: image,
          year,
          rating,
          description,
          url: link,
          progress: 0
        });
      }
      
      navigate(`/movie/${encodeURIComponent(title)}`, {
        state: { title, image, iframeUrl: link }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error("Произошла ошибка при переходе к фильму");
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Войдите в систему, чтобы сохранять фильмы", {
        action: {
          label: "Войти",
          onClick: () => navigate("/auth")
        }
      });
      return;
    }

    try {
      soundEffects.play("save");
      setIsLoading(true);
      
      if (!isLiked) {
        const success = await addToSaved({
          title,
          type,
          poster: image,
          year,
          rating,
          description,
          url: link
        });
        
        if (success) {
          toast.success("Фильм добавлен в избранное");
        } else {
          toast.error("Ошибка при сохранении фильма");
        }
      } else {
        // Находим ID сохраненного элемента
        const savedItem = savedItems.find(item => item.url === link);
        if (savedItem) {
          const success = await removeFromSaved(savedItem.id);
          if (success) {
            toast.success("Фильм удален из избранного");
          } else {
            toast.error("Ошибка при удалении фильма");
          }
        }
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
      toast.error("Произошла ошибка");
    } finally {
      setIsLoading(false);
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
    <div className={cn("group flex flex-col gap-2.5", className)}>
      <motion.div
        className="cinema-card relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary/30"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.img
          src={image || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
        <video
          ref={previewVideoRef}
          src="/cinematic-preview.mp4"
          poster="/cinematic-preview-cover.png"
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            isHovered ? "opacity-80" : "opacity-0"
          )}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-3 z-20 flex gap-2"
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 border border-white/15 bg-[#070914]/75 text-white backdrop-blur-sm hover:border-primary/60 hover:bg-primary hover:text-primary-foreground"
                onClick={handleLike}
                disabled={isLoading}
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                >
                  <Heart className={cn("h-4 w-4", isLiked ? "fill-primary text-primary" : "")} />
                </motion.div>
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 border border-white/15 bg-[#070914]/75 text-white backdrop-blur-sm hover:border-primary/60 hover:bg-primary hover:text-primary-foreground"
                onClick={handleShare}
              >
                <motion.div whileTap={{ scale: 0.8 }}>
                  <Share2 className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="absolute inset-0 z-10 bg-gradient-to-t from-[#070914] via-[#070914]/22 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
        >
          <div className="absolute bottom-0 p-6 w-full">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-3 text-primary"
            >
              <span className="cinema-play-button h-10 w-10"><Play className="h-4 w-4 translate-x-px" fill="currentColor" /></span>
              <span className="text-xs font-bold uppercase tracking-[0.16em]">Смотреть</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      <motion.h3
        className="truncate text-lg font-bold tracking-[-0.02em] text-foreground"
        whileHover={{ color: 'hsl(var(--primary))' }}
        transition={{ duration: 0.2 }}
      >
        {title}
      </motion.h3>
    </div>
  );
}
