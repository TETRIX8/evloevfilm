import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { MoviePlayer } from "@/components/MoviePlayer";
import { Navigation } from "@/components/navigation/Navigation";
import { Button } from "@/components/ui/button";
import { fetchMovieDetails } from "@/services/api";
import { Film, Loader2 } from "lucide-react";
import { SEO, SITE_URL } from "@/components/SEO";

type MovieState = { title: string; iframeUrl: string; image?: string; description?: string; year?: number; rating?: number };

export default function Movie() {
  const location = useLocation();
  const { title: routeTitle } = useParams<{ title: string }>();
  const state = location.state as MovieState | null;
  const [movieData, setMovieData] = useState<MovieState | null>(state);
  const [isLoading, setIsLoading] = useState(!state);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state) {
      setMovieData(state);
      setNotFound(false);
      setIsLoading(false);
      return;
    }

    let decodedTitle = routeTitle || "";
    try { decodedTitle = decodeURIComponent(decodedTitle); } catch { /* keep the raw route value */ }
    if (!decodedTitle) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    fetchMovieDetails(decodedTitle)
      .then((details) => {
        if (details?.iframe_url) {
          setMovieData({ title: decodedTitle, iframeUrl: details.iframe_url, image: details.poster, description: details.description, year: details.year, rating: details.rating });
        } else {
          setMovieData(null);
          setNotFound(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
        setMovieData(null);
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [location.key, routeTitle, state]);

  const canonicalPath = `/movie/${encodeURIComponent(movieData?.title || routeTitle || "")}`;
  if (isLoading) return <div className="page-shell grid min-h-screen place-items-center"><SEO title={routeTitle || "Фильм"} path={canonicalPath} /><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (notFound || !movieData) return <div className="page-shell"><SEO title="Фильм не найден" path={canonicalPath} noindex /><Navigation /><main className="content-container grid min-h-[70vh] place-items-center pt-28"><section className="surface-panel max-w-md p-8 text-center"><Film className="mx-auto h-10 w-10 text-primary" /><h1 className="mt-4 text-xl font-extrabold">Фильм не найден</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Страница сохранилась, но каталог не вернул данные для этого названия. Вернитесь в каталог и откройте фильм ещё раз.</p><Button asChild className="mt-6"><Link to="/">Вернуться в каталог</Link></Button></section></main></div>;

  return <div className="page-shell"><SEO title={`Смотреть ${movieData.title}`} description={movieData.description || `Смотреть фильм «${movieData.title}» онлайн на EVLOEVFILM.`} path={canonicalPath} type="video.movie" image={movieData.image} jsonLd={{ "@context": "https://schema.org", "@type": "Movie", name: movieData.title, url: `${SITE_URL}${canonicalPath}`, image: movieData.image, description: movieData.description || `Смотреть фильм «${movieData.title}» онлайн на EVLOEVFILM.`, dateCreated: movieData.year ? String(movieData.year) : undefined, aggregateRating: movieData.rating ? { "@type": "AggregateRating", ratingValue: movieData.rating, bestRating: 10, ratingCount: 1 } : undefined }} /><Navigation /><div className="pt-[72px]"><MoviePlayer title={movieData.title} iframeUrl={movieData.iframeUrl} /></div></div>;
}
