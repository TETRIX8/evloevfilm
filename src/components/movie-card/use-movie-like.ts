
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { soundEffects } from "@/utils/soundEffects";

export const useMovieLike = (title: string, image: string, link: string) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
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

  return {
    isLiked,
    isLoading,
    handleLike
  };
};
