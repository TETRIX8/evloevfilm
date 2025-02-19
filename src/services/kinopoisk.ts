
const KINOPOISK_API_KEY = "5W6J03Z-ZNT4Y0V-MC7SVYX-WQS4ZEN";
const BASE_URL = "https://api.kinopoisk.dev/v1.4";

export interface KinopoiskMovie {
  id: number;
  name: string;
  year: number;
  rating: {
    kp: number;
    imdb: number;
  };
  description: string;
  movieLength: number;
  genres: Array<{ name: string }>;
  countries: Array<{ name: string }>;
  poster: {
    url: string;
  };
  backdrop: {
    url: string;
  };
}

export async function fetchKinopoiskMovie(id: string): Promise<KinopoiskMovie | null> {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}`, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': KINOPOISK_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movie data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching KinoPoisk data:', error);
    return null;
  }
}
