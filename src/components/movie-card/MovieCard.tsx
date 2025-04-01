
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MovieCardProps } from "./types";
import { MovieCardOverlay } from "./MovieCardOverlay";
import { MovieCardActions } from "./MovieCardActions";

interface ExtendedMovieCardProps extends MovieCardProps {
  isLiked?: boolean;
  isLoading?: boolean;
  onLike?: (e: React.MouseEvent) => void;
}

export function MovieCard({
  title,
  image,
  link,
  className,
  priority = false,
  aspectRatio = "portrait",
  width = 250,
  showActions = true,
  onPlay,
  isLiked = false,
  isLoading = false,
  onLike,
}: ExtendedMovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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
          src={image}
          alt={title}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            aspectRatio: aspectRatio === "portrait" ? "3 / 4" : "16 / 9",
          }}
        />
      </div>
      
      <MovieCardOverlay 
        title={title}
        image={image}
        isHovered={isHovered}
        aspectRatio={aspectRatio}
        onPlay={handlePlayClick}
      />
      
      {showActions && (
        <MovieCardActions
          title={title}
          image={image}
          link={link}
          isLiked={isLiked}
          onLike={onLike || (() => {})}
          isHovered={isHovered}
        />
      )}
    </Card>
  );
}
