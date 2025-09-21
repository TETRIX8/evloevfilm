import { useLocation, Navigate, useParams } from "react-router-dom";
import { AnimePlayer } from "@/components/anime/AnimePlayer";
import { KodikAnimeItem } from "@/services/kodik-api";

export default function AnimeWatch() {
  const location = useLocation();
  const { title } = useParams();
  
  // Get anime data from navigation state
  const anime = location.state?.anime as KodikAnimeItem | null;

  // If no anime data is provided, redirect to anime page
  if (!anime) {
    return <Navigate to="/anime" replace />;
  }

  return <AnimePlayer anime={anime} />;
}