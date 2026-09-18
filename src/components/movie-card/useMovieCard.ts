import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { soundEffects } from '@/utils/soundEffects';

export function useMovieCard(title: string, image: string, link: string) {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const { savedItems, isSaved, addToSaved, removeFromSaved } = useFirebaseStorage();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isLiked = isSaved(link);
  const handleClick = (e: React.MouseEvent) => { e.preventDefault(); soundEffects.play('click'); navigate(`/movie/${encodeURIComponent(title)}`, { state: { title, image, iframeUrl: link } }); };
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Войдите в систему, чтобы сохранять фильмы'); return; }
    setIsLoading(true);
    try {
      const saved = savedItems.find((item) => item.url === link);
      const ok = saved ? await removeFromSaved(saved.id) : await addToSaved({ title, poster: image, url: link, type: 'movie' });
      if (!ok) throw new Error('save failed');
    } catch (error) { console.error(error); toast.error('Ошибка сохранения фильма'); }
    finally { setIsLoading(false); }
  };
  const handleShare = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard?.writeText(`${window.location.origin}/movie/${encodeURIComponent(title)}`); toast.success('Ссылка скопирована в буфер обмена'); };
  return { isLiked, isHovered, isLoading, setIsHovered, handleClick, handleLike, handleShare };
}
