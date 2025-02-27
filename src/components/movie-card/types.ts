
export interface MovieCardProps {
  title: string;
  image: string;
  link: string;
  className?: string;
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
