import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { MovieTrailerPreview } from "./MovieTrailerPreview";
import { MovieCardActions } from "./MovieCardActions";
import { MovieCardOverlay } from "./MovieCardOverlay";

interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function MovieCard({ title, image, link, className }: MovieCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setTimeout(() => setShowTrailer(true), 1000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTrailer(false);
  };

  const handleClick = () => {
    navigate(`/movie/${encodeURIComponent(title)}`, {
      state: { title, image, iframeUrl: link }
    });
  };

  return (
    <motion.div
      className={cn(
        "group relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary/30",
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.img
        src={image || "/placeholder.svg"}
        alt={title}
        className="h-full w-full object-cover"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.5 }}
      />

      <MovieTrailerPreview 
        isHovered={showTrailer} 
        link={link}
      />

      <MovieCardActions 
        isHovered={isHovered}
        title={title}
        image={image}
        link={link}
      />

      <MovieCardOverlay 
        title={title}
      />
    </motion.div>
  );
}