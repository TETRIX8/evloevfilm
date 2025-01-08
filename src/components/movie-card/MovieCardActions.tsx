import { useState, useEffect } from "react";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { soundEffects } from "@/utils/soundEffects";

interface MovieCardActionsProps {
  isHovered: boolean;
  title: string;
  image: string;
  link: string;
}

export function MovieCardActions({ isHovered, title, image, link }: MovieCardActionsProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }

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
      } catch (error) {
        console.error('Error in checkSavedStatus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedStatus();
  }, [title]);

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
        
        soundEffects.play("save");
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
        
        soundEffects.play("save");
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
            disabled={isLoading}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
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
  );
}