
import React, { useEffect, useRef, useState } from "react";
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
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const previewVideo = previewVideoRef.current;
    if (!previewVideo) return;

    if (isHovered) {
      void previewVideo.play().catch(() => undefined);
      return;
    }

    previewVideo.pause();
    previewVideo.currentTime = 0;
  }, [isHovered]);
  
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
        "cinema-card group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300",
        className
      )}
      style={{ width }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 rounded-[0.9rem] bg-[#070914]/70 transition-opacity duration-500",
            isHovered ? "opacity-0" : "opacity-80 group-hover:opacity-0"
          )}
        />
        <img
          src={image}
          alt={title}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          style={{
            aspectRatio: aspectRatio === "portrait" ? "3 / 4" : "16 / 9",
          }}
        />
        <video
          ref={previewVideoRef}
          src="/cinematic-preview.mp4"
          poster="/cinematic-preview-cover.png"
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            isHovered ? "opacity-80" : "opacity-0"
          )}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
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
          onLike={onLike || ((e) => {})}
          isHovered={isHovered}
        />
      )}
    </Card>
  );
}
