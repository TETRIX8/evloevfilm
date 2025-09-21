
const KINOPOISK_API_KEY = "5W6J03Z-ZNT4Y0V-MC7SVYX-WQS4ZEN";
const BASE_URL = "https://api.kinopoisk.dev/v1.4";
const UNOFFICIAL_API_KEY = "f541243d-43ef-4e4e-a710-9d6a2eb02f26";

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

export interface MovieStill {
  imageUrl: string;
  previewUrl: string;
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

export async function fetchMovieStills(id: string): Promise<MovieStill[]> {
  try {
    const response = await fetch(
      `https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}/images?type=STILL&page=1`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': UNOFFICIAL_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie stills');
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      imageUrl: item.imageUrl,
      previewUrl: item.previewUrl
    }));
  } catch (error) {
    console.error('Error fetching movie stills:', error);
    return [];
  }
}
