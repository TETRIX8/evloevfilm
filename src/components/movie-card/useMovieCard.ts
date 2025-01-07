import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { soundEffects } from "@/utils/soundEffects";

export function useMovieCard(title: string, image: string, link: string) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
          toast.error("Ошибка при проверке статуса фильма");
          return;
        }

        setIsLiked(!!data);
      } catch (error) {
        console.error('Error in checkSavedStatus:', error);
        toast.error("Произошла ошибка при проверке статуса фильма");
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSavedStatus();
    });

    return () => subscription.unsubscribe();
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

  return {
    isLiked,
    isHovered,
    isLoading,
    setIsHovered,
    handleClick,
    handleLike,
    handleShare
  };
}