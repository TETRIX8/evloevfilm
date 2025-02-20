import { useLocation, Navigate } from "react-router-dom";
import { MoviePlayer } from "@/components/MoviePlayer";

export default function Movie() {
  const location = useLocation();
  const state = location.state as { title: string; iframeUrl: string } | null;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  return <MoviePlayer title={state.title} iframeUrl={state.iframeUrl} />;
}