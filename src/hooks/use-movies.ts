import { useQuery } from "@tanstack/react-query";
import { fetchMovies, searchMovies, MovieData } from "@/services/api";

export function useMovies(year: string) {
  const newMovies = useQuery({
    queryKey: ["new-movies", year],
    queryFn: () => fetchMovies('films', year),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  const newTVShows = useQuery({
    queryKey: ["new-tvshows", year],
    queryFn: () => fetchMovies('serials', year),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  const newCartoons = useQuery({
    queryKey: ["new-cartoons", year],
    queryFn: () => fetchMovies('cartoon', year),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  return {
    newMovies,
    newTVShows,
    newCartoons,
  };
}

export function useMovieSearch(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: () => searchMovies(searchTerm),
    enabled: searchTerm.length > 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });
}