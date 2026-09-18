import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { soundEffects } from '@/utils/soundEffects';

export const useMovieLike = (title: string, image: string, link: string) => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { savedItems, isSaved, addToSaved, removeFromSaved } = useFirebaseStorage();
  const [isLoading, setIsLoading] = useState(true);
  const isLiked = isSaved(link);
  useEffect(() => { setIsLoading(false); }, [isLiked, user?.uid]);
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Войдите в систему, чтобы сохранять фильмы', { action: { label: 'Войти', onClick: () => navigate('/auth') } }); return; }
    setIsLoading(true);
    try {
      soundEffects.play('save');
      const saved = savedItems.find((item) => item.url === link);
      const ok = saved ? await removeFromSaved(saved.id) : await addToSaved({ title, poster: image, url: link, type: 'movie' });
      if (!ok) throw new Error('save failed');
      if (saved) toast.success('Фильм удален из избранного');
    } catch (error) { console.error(error); toast.error('Ошибка сохранения фильма'); }
    finally { setIsLoading(false); }
  };
  return { isLiked, isLoading, handleLike };
};
