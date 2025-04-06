
import { useLocation, Navigate } from "react-router-dom";
import { MoviePlayer } from "@/components/MoviePlayer";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/services/api";

export default function Movie() {
  const location = useLocation();
  const state = location.state as { title: string; iframeUrl: string; image?: string } | null;
  const [movieData, setMovieData] = useState(state);
  const [isLoading, setIsLoading] = useState(false);

  // Extract movie title from URL if state is missing
  useEffect(() => {
    if (!state) {
      const pathSegments = location.pathname.split('/');
      const encodedTitle = pathSegments[pathSegments.length - 1];
      const decodedTitle = decodeURIComponent(encodedTitle);
      
      if (decodedTitle) {
        setIsLoading(true);
        fetchMovieDetails(decodedTitle)
          .then(details => {
            if (details?.iframe_url) {
              setMovieData({
                title: decodedTitle,
                iframeUrl: details.iframe_url,
                image: details.poster || undefined
              });
            }
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Error fetching movie details:", err);
            setIsLoading(false);
          });
      }
    }
  }, [location.pathname, state]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!movieData) {
    return <Navigate to="/" replace />;
  }

  return <MoviePlayer title={movieData.title} iframeUrl={movieData.iframeUrl} />;
}
