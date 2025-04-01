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

export interface MovieCardOverlayProps {
  title: string;
  image: string;
  isHovered: boolean;
  aspectRatio: "portrait" | "landscape";
  onPlay: () => void;
}

export interface MovieCardActionsProps {
  title: string;
  image: string;
  link: string;
  isLiked: boolean;
  isHovered: boolean;
  onLike: (e: React.MouseEvent) => void;
}
