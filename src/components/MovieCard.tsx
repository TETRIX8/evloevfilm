import { cn } from "@/lib/utils";
import { Heart, Share2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundEffects } from "@/utils/soundEffects";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function MovieCard({ title, image, link, className }: MovieCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        setIsLoading(true);
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        const session = sessionData.session as Session | null;
        
        if (session?.user?.id) {
          setUserId(session.user.id);
          const { data, error } = await supabase
            .from('saved_movies')
            .select()
            .eq('user_id', session.user.id)
            .eq('title', title)
            .maybeSingle();

          if (error) {
            console.error('Error checking saved status:', error);
            return;
          }

          setIsLiked(!!data);
        }
      } catch (error) {
        console.error('Error in checkSavedStatus:', error);
        toast.error("Произошла ошибка при проверке статуса фильма");
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedStatus();
  }, [title]);

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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      toast.error("Войдите в систему, чтобы сохранять фильмы", {
        action: {
          label: "Войти",
          onClick: () => navigate("/profile")
        }
      });
      return;
    }

    try {
      soundEffects.play("save");
      setIsLoading(true);
      
      if (!isLiked) {
        const { error } = await supabase
          .from('saved_movies')
          .insert([
            { user_id: userId, title, image, link }
          ]);
        
        if (error) {
          console.error('Error saving movie:', error);
          toast.error("Ошибка при сохранении фильма");
          return;
        }
        
        toast.success("Фильм добавлен в сохраненные");
      } else {
        const { error } = await supabase
          .from('saved_movies')
          .delete()
          .eq('user_id', userId)
          .eq('title', title);
        
        if (error) {
          console.error('Error removing movie:', error);
          toast.error("Ошибка при удалении фильма");
          return;
        }
        
        toast.success("Фильм удален из сохраненных");
      }
      
      setIsLiked(!isLiked);
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
    <motion.div
      className={cn(
        "group relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary/30",
        className
      )}
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
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex gap-2"
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={handleLike}
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
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
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
        className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
      >
        <div className="absolute bottom-0 p-6 w-full">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-cinzel text-2xl font-bold tracking-wide truncate mb-2 text-white drop-shadow-lg"
          >
            {title}
          </motion.h3>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-2 text-primary"
          >
            <Play className="h-5 w-5" />
            <span className="text-sm font-medium">Смотреть</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}