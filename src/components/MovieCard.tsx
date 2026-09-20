import { cn } from "@/lib/utils";
import { Heart, Play, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { soundEffects } from "@/utils/soundEffects";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useFirebaseStorage } from "@/hooks/use-firebase-storage";

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
  type?: "movie" | "anime";
  year?: number;
  rating?: number;
  description?: string;
  id?: string;
}

export function MovieCard({ title, image, link, className, type = "movie", year, rating, description }: MovieCardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useFirebaseAuth();
  const { savedItems, isSaved, addToSaved, removeFromSaved, addToHistory } = useFirebaseStorage();
  const isLiked = isSaved(link);

  const handleOpen = async () => {
    try {
      soundEffects.play("click");
      if (user) await addToHistory({ title, type, poster: image, year, rating, description, url: link, progress: 0 });
      navigate(`/movie/${encodeURIComponent(title)}`, { state: { title, image, iframeUrl: link } });
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Не удалось открыть фильм");
    }
  };

  const handleLike = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) {
      toast.error("Войдите, чтобы сохранять фильмы", { action: { label: "Войти", onClick: () => navigate("/auth") } });
      return;
    }
    try {
      soundEffects.play("save");
      setIsLoading(true);
      if (!isLiked) {
        const success = await addToSaved({ title, type, poster: image, year, rating, description, url: link });
        toast[success ? "success" : "error"](success ? "Добавлено в избранное" : "Не удалось сохранить фильм");
      } else {
        const savedItem = savedItems.find((item) => item.url === link);
        if (savedItem) {
          const success = await removeFromSaved(savedItem.id);
          toast[success ? "success" : "error"](success ? "Удалено из избранного" : "Не удалось удалить фильм");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Не удалось изменить избранное");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const shareUrl = `${window.location.origin}/movie/${encodeURIComponent(title)}`;
    try {
      if (navigator.share) await navigator.share({ title, url: shareUrl });
      else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Ссылка скопирована");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Не удалось поделиться ссылкой");
    }
  };

  return (
    <article className={cn("group min-w-0", className)}>
      <div className="poster-frame relative aspect-[2/3] transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/45 group-hover:shadow-[0_22px_45px_rgba(0,0,0,.36)]">
        <button type="button" onClick={handleOpen} className="absolute inset-0 z-0 block w-full text-left" aria-label={`Открыть «${title}»`}>
          <img src={image || "/placeholder.svg"} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,.08)_35%,rgba(6,7,10,.86)_100%)]" />
          <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 px-4 pb-4 text-xs font-extrabold text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" /></span> Смотреть
          </span>
        </button>
        <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button type="button" onClick={handleLike} disabled={isLoading} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-[#0c0e13]/80 text-white backdrop-blur transition hover:border-primary/60 hover:text-primary disabled:opacity-50" aria-label={isLiked ? "Удалить из избранного" : "Добавить в избранное"}>
            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-primary text-primary")} />
          </button>
          <button type="button" onClick={handleShare} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-[#0c0e13]/80 text-white backdrop-blur transition hover:border-primary/60 hover:text-primary" aria-label={`Поделиться «${title}»`}>
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <button type="button" onClick={handleOpen} className="movie-title mt-3 block w-full truncate text-left text-sm font-extrabold leading-5 text-foreground" title={title}>{title}</button>
      {year || rating ? <p className="mt-1 text-xs text-muted-foreground">{year ? year : ""}{year && rating ? " · " : ""}{rating ? `${rating.toFixed(1)} / 10` : ""}</p> : null}
    </article>
  );
}
