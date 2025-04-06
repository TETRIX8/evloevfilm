
export interface AllohaMovieResponse {
  status: 'success' | 'error';
  data?: AllohaMovieData;
  message?: string;
  error_info?: string;
}

export interface AllohaMovieData {
  name: string;
  original_name?: string;
  year?: number;
  country?: string;
  genre?: string;
  age_restrictions?: string;
  time?: string;
  
  rating_kp?: number;
  rating_imdb?: number;
  rating_mpaa?: string;
  
  premiere?: string;
  premiere_ru?: string;
  
  actors?: string[] | string;
  directors?: string[] | string;
  producers?: string[] | string;
  
  description?: string;
  tagline?: string;
  poster?: string;
  quality?: string;
  translation?: string;
  trailer?: string;
}

const ALLOHA_API_KEY = "04941a9a3ca3ac16e2b4327347bbc1";
const ALLOHA_BASE_URL = "https://api.alloha.tv";

export async function fetchAllohaMovieDetails(kinopoiskId: string): Promise<AllohaMovieData | null> {
  if (!kinopoiskId) return null;
  
  try {
    const url = new URL(ALLOHA_BASE_URL);
    url.searchParams.append('token', ALLOHA_API_KEY);
    url.searchParams.append('kp', kinopoiskId);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data: AllohaMovieResponse = await response.json();
    
    if (data.status === 'error' || !data.data) {
      console.error('Alloha API error:', data.message || data.error_info || data);
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching Alloha movie details:', error);
    return null;
  }
}
