import { CinematicLoadingStage } from "../animations/CinematicLoadingStage";

interface LoadingPreviewProps {
  animation: string;
}

export function LoadingPreview({ animation }: LoadingPreviewProps) {
  return <CinematicLoadingStage variant={animation} compact />;
}
