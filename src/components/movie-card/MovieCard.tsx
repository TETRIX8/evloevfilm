import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MovieCardProps } from "./types";
import { MovieCardOverlay } from "./MovieCardOverlay";
import { MovieCardActions } from "./MovieCardActions";
import { useMovieCard } from "./useMovieCard";

export function MovieCard({
  movie,
  className,
  priority = false,
  aspectRatio = "portrait",
  width = 250,
  showActions = true,
  onPlay,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { movieDetails, isLoading, handleLike, isLiked } = useMovieCard(movie);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-lg transition-shadow hover:shadow-xl cursor-pointer",
        className
      )}
      style={{ width }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 rounded-md bg-zinc-900 transition-opacity duration-500 dark:bg-zinc-700/40",
            isHovered ? "opacity-0" : "opacity-80 group-hover:opacity-0"
          )}
        />
        <img
          src={movie.image}
          alt={movie.title}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            aspectRatio: aspectRatio === "portrait" ? "3 / 4" : "16 / 9",
          }}
          priority={priority}
        />
      </div>
      
      <MovieCardOverlay 
        isHovered={isHovered}
        movie={movie}
        aspectRatio={aspectRatio}
        movieDetails={movieDetails}
        onPlay={handlePlayClick} // Fixed: Pass the event handler correctly
      />
      
      {showActions && (
        <MovieCardActions
          movie={movie}
          isLiked={isLiked}
          onLike={handleLike}
          isHovered={isHovered}
        />
      )}
    </Card>
  );
}
