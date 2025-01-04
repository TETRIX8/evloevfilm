import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MovieCardActions } from "./MovieCardActions";
import { MovieCardOverlay } from "./MovieCardOverlay";
import { useMovieCard } from "./useMovieCard";

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function MovieCard({ title, image, link, className }: MovieCardProps) {
  const {
    isLiked,
    isHovered,
    setIsHovered,
    handleClick,
    handleLike,
    handleShare
  } = useMovieCard(title, image, link);

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
      
      <MovieCardActions
        isHovered={isHovered}
        isLiked={isLiked}
        onLike={handleLike}
        onShare={handleShare}
      />
      
      <MovieCardOverlay
        title={title}
        onClick={handleClick}
      />
    </motion.div>
  );
}