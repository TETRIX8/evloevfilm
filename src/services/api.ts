const API_TOKEN = "3794a7638b5863cc60d7b2b9274fa32e";
const BASE_URL = "https://api1673051707.bhcesh.me/list";

export interface MovieApiResponse {
  total: number;
  results: Array<{
    id: number;
    name: string;
    poster: string;
    iframe_url: string;
  }>;
}

export interface MovieData {
  title: string;
  image: string;
  link: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000)));
    }
  }
  throw new Error('Failed to fetch after retries');
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
    const url = new URL(BASE_URL);
    url.searchParams.append('token', API_TOKEN);
    url.searchParams.append('name', searchTerm);

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