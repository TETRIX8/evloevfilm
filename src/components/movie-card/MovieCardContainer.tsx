
import { useState } from "react";
import { useMovieLike } from "./use-movie-like";
import { WebGLSavePopup } from "@/components/animations/WebGLSavePopup";
import { MovieCardProps } from "./types";
import { MovieCard } from "./MovieCard";

export function MovieCardContainer({ title, image, link, className, priority, aspectRatio, width, showActions, onPlay }: MovieCardProps) {
  const { isLiked, isLoading, handleLike } = useMovieLike(title, image, link);
  const [showSavePopup, setShowSavePopup] = useState(false);
  
  const handleLikeWithPopup = async (e: React.MouseEvent) => {
    // Call the original handleLike function
    await handleLike(e);
    
    // If the movie wasn't already liked, show the popup
    if (!isLiked) {
      setShowSavePopup(true);
    }
  };
  
  return (
    <>
      <MovieCard
        title={title}
        image={image}
        link={link}
        className={className}
        priority={priority}
        aspectRatio={aspectRatio}
        width={width}
        showActions={showActions}
        onPlay={onPlay}
        isLiked={isLiked}
        isLoading={isLoading}
        onLike={handleLikeWithPopup}
      />
      
      <WebGLSavePopup
        isOpen={showSavePopup}
        onClose={() => setShowSavePopup(false)}
        title={title}
        image={image}
      />
    </>
  );
}
