const API_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const BASE_URL = "https://api1673051707.bhcesh.me/list";

export interface MovieApiResponse {
  total: number;
  results: Array<{
    id: number;
    name: string;
    poster: string;
    iframe_url: string;
    description?: string;
    year?: number;
    rating?: number;
    genres?: string[];
  }>;
}

export interface MovieData {
  title: string;
  image: string;
  link: string;
}

export interface MovieDetails {
  description?: string;
  year?: number;
  rating?: number;
  genres?: string[];
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error as Error;
      
      if (i === retries - 1) {
        break;
      }
      
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000))
      );
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

export async function fetchMovieDetails(title: string): Promise<MovieDetails | null> {
  try {
    // Decode first in case the title is already encoded from the URL
    const decodedTitle = decodeURIComponent(title);
    // Then encode properly for the API request
    const encodedTitle = encodeURIComponent(decodedTitle);
    
    const url = new URL(BASE_URL);
    url.searchParams.append('token', API_TOKEN);
    url.searchParams.append('name', encodedTitle);
    url.searchParams.append('limit', '1');

    console.log('Fetching movie details for URL:', url.toString());
    
    const response = await fetchWithRetry(url.toString());
    const data: MovieApiResponse = await response.json();
    
    console.log('Movie details response:', data);
    
    if (!data.results?.[0]) {
      console.log('No movie details found');
      return null;
    }
    
    const movie = data.results[0];
    return {
      description: movie.description,
      year: movie.year,
      rating: movie.rating,
      genres: movie.genres
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

export async function fetchMovies(type: 'films' | 'serials' | 'cartoon', year: string): Promise<MovieData[]> {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('token', API_TOKEN);
    url.searchParams.append('sort', '-views');
    url.searchParams.append('type', type);
    url.searchParams.append('limit', '50');
    url.searchParams.append('year', year);
    
    if (type === 'serials') {
      url.searchParams.append('join_seasons', 'false');
    }

    console.log('Fetching movies for URL:', url.toString());
    
    const response = await fetchWithRetry(url.toString());
    const data: MovieApiResponse = await response.json();
    
    return data.results?.map(item => ({
      title: item.name,
      image: item.poster,
      link: item.iframe_url
    })) || [];
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
}

export async function searchMovies(searchTerm: string): Promise<MovieData[]> {
  if (!searchTerm) return [];
  
  try {
    // Decode first in case the search term is already encoded
    const decodedTerm = decodeURIComponent(searchTerm);
    // Then encode properly for the API request
    const encodedSearchTerm = encodeURIComponent(decodedTerm);
    
    const url = new URL(BASE_URL);
    url.searchParams.append('token', API_TOKEN);
    url.searchParams.append('name', encodedSearchTerm);

    console.log('Searching movies for URL:', url.toString());
    
    const response = await fetchWithRetry(url.toString());
    const data: MovieApiResponse = await response.json();
    
    return data.results?.map(item => ({
      title: item.name,
      image: item.poster,
      link: item.iframe_url
    })) || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
}