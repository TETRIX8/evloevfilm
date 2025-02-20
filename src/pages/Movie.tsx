
import { useLocation, Navigate, useParams } from "react-router-dom";
import { MoviePlayer } from "@/components/MoviePlayer";
import { useEffect, useState } from "react";

interface MovieData {
  title: string;
  image: string;
  iframeUrl: string;
}

export default function Movie() {
  const location = useLocation();
  const { title } = useParams();
  const [movieData, setMovieData] = useState<MovieData | null>(null);

  useEffect(() => {
    // Если данные переданы через location state, используем их
    if (location.state) {
      setMovieData({
        title: location.state.title,
        image: location.state.image,
        iframeUrl: location.state.iframeUrl
      });
      return;
    }

    // Иначе пытаемся найти фильм в localStorage
    if (title) {
      const decodedTitle = decodeURIComponent(title);
      const savedMovies = JSON.parse(localStorage.getItem("savedMovies") || "[]");
      const historyMovies = JSON.parse(localStorage.getItem("watchHistory") || "[]");
      
      const movieFromStorage = [...savedMovies, ...historyMovies].find(
        (movie: any) => movie.title === decodedTitle
      );

      if (movieFromStorage) {
        setMovieData({
          title: movieFromStorage.title,
          image: movieFromStorage.image,
          iframeUrl: movieFromStorage.link
        });
        return;
      }
    }
  }, [location.state, title]);

  if (!movieData) {
    return <Navigate to="/" replace />;
  }

  return <MoviePlayer title={movieData.title} iframeUrl={movieData.iframeUrl} />;
}
