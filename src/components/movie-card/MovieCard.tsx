import { cn } from "@/lib/utils";
import { Heart, Share2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundEffects } from "@/utils/soundEffects";
import { supabase } from "@/integrations/supabase/client";
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
    // Delay trailer preview to prevent immediate load
    setTimeout(() => setShowTrailer(true), 1000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTrailer(false);
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
        link={link}
      />

      <MovieCardOverlay 
        title={title}
        link={link}
      />
    </motion.div>
  );
}