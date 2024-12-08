import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function MovieCard({ title, image, link, className }: MovieCardProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/movie/${encodeURIComponent(title)}`, {
      state: { title, iframeUrl: link }
    });
  };

  return (
    <a
      href={link}
      onClick={handleClick}
      className={cn(
        "group relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary/30 transition-all duration-300 hover:scale-105",
        className
      )}
    >
      <img
        src={image || "/placeholder.svg"}
        alt={title}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 p-4 w-full">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          <div className="mt-2 flex items-center gap-2 text-primary">
            <Play className="h-4 w-4" />
            <span className="text-sm">Смотреть</span>
          </div>
        </div>
      </div>
    </a>
  );
}