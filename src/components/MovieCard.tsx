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

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
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
      }
    };

    checkSavedStatus();
  }, [title]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEffects.play("click");
    navigate(`/movie/${encodeURIComponent(title)}`, {
      state: { title, image, iframeUrl: link }
    });
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      toast.error("Войдите, чтобы сохранять фильмы");
      navigate("/auth");
      return;
    }

    soundEffects.play("save");
    
    try {
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
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundEffects.play("click");
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
        className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
      >
        <div className="absolute bottom-0 p-4 w-full">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-semibold text-lg truncate"
          >
            {title}
          </motion.h3>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-2 flex items-center gap-2 text-primary"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm">Смотреть</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}