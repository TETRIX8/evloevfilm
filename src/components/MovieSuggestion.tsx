import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMovies } from "@/hooks/use-movies";
import { getCurrentYear } from "@/utils/date";

export function MovieSuggestion() {
  const [open, setOpen] = useState(false);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const currentYear = getCurrentYear().toString();
  const { newMovies } = useMovies(currentYear);

  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      const timer = setTimeout(() => {
        setOpen(true);
      }, 15000); // 15 seconds
      setIdleTimer(timer);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [idleTimer]);

  const getRandomMovie = () => {
    if (!newMovies.data || newMovies.data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * newMovies.data.length);
    return newMovies.data[randomIndex];
  };

  const randomMovie = getRandomMovie();

  const handleWatch = () => {
    if (randomMovie) {
      setOpen(false);
      navigate(`/movie/${encodeURIComponent(randomMovie.title)}`, {
        state: { 
          title: randomMovie.title, 
          image: randomMovie.image, 
          iframeUrl: randomMovie.link 
        }
      });
    }
  };

  if (!randomMovie) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Рекомендуем посмотреть</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img 
            src={randomMovie.image} 
            alt={randomMovie.title} 
            className="w-full h-48 object-cover rounded-lg"
          />
          <h3 className="text-lg font-semibold">{randomMovie.title}</h3>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Закрыть
            </Button>
            <Button onClick={handleWatch}>
              Смотреть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}