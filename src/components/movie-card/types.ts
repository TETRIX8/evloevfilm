
import { ReactNode } from "react";

export interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: "portrait" | "landscape";
  width?: number;
  showActions?: boolean;
  onPlay?: () => void;
}

export interface MovieActionsProps {
  isHovered: boolean;
  isLiked: boolean;
  isLoading: boolean;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

export interface MovieOverlayProps {
  title: string;
  onClick: () => void;
}

export interface MovieCardOverlayProps {
  title: string;
  image?: string;
  isHovered?: boolean;
  aspectRatio?: "portrait" | "landscape";
  onPlay?: (e: React.MouseEvent) => void;
}

export interface MovieCardActionsProps {
  title: string;
  image?: string;
  link?: string;
  isLiked: boolean;
  onLike: (e: React.MouseEvent) => Promise<void>;
  isHovered: boolean;
}

