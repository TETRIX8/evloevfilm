/**
 * AniType API Service
 * Новый API сервис для работы с AniType.site API
 * Документация: https://anitype.site/
 */

export interface AnimeTitle {
  ID: number;
  original: string;
  russian: string;
  english: string;
  japanese: string;
  russian_alternative: string;
  russian_kp: string;
}

export interface AnimeGenre {
  ID: number;
  source_id: string;
  title: string;
  to_anime_id: number;
}

export interface AnimeStudio {
  ID: number;
  source_id: string;
  title: string;
  to_anime_id: number;
}

export interface AnimeVideo {
  episode: number;
  season: number;
  translation: {
    title: string;
    this_anime_count: number;
    has_uhd: boolean;
  };
  links: {
    kodik: string;
    worldArt?: string;
  };
  has_uhd: boolean;
  picture: string;
  watches: number;
  likes: number;
}

export interface KodikAnimeInfo {
  id: string;
  type: string;
  link: string;
  title: string;
  title_orig: string;
  other_title: string;
  translation: {
    id: number;
    title: string;
    type: "voice" | "subtitles";
  };
  year: number;
  last_season: number;
  last_episode: number;
  episodes_count: number;
  kinopoisk_id?: string;
  imdb_id?: string;
  worldart_link?: string;
  shikimori_id: string;
  quality: string;
  camrip: boolean;
  lgbt: boolean;
  blocked_countries: string[];
  blocked_seasons: Record<string, any>;
  created_at: string;
  updated_at: string;
  seasons: Record<string, {
    link: string;
    episodes: Record<string, string>;
  }>;
  screenshots: string[];
}

export interface KodikSearchResponse {
  results: KodikAnimeInfo[];
}

export interface AnimeItem {
  id: number;
  shikimori_id: number;
  title: string;
  russian: string;
  image: {
    original: string;
    preview: string;
    x96: string;
    x48: string;
  };
  url: string;
  kind: string;
  score: string;
  status: "released" | "ongoing" | "anons";
  episodes: number;
  episodes_aired: number;
  aired_on: string;
  released_on?: string;
  rating: string;
  duration: number;
  description: string;
  description_html: string;
  franchise?: string;
  favoured: boolean;
  anons: boolean;
  ongoing: boolean;
  licensors: any[];
  genres: AnimeGenre[];
  studios: AnimeStudio[];
  videos?: any;
  relations?: any;
  similar: any[];
  characters?: any;
  external_links: any[];
}

export interface AnimeSearchItem {
  id: number;
  titles: AnimeTitle;
  description: string;
  kind: "tv" | "movie" | "ova" | "special";
  score: number;
  status: "ongoing" | "released" | "anons";
  rating: string;
  episodes: number;
  episodes_aired: number;
  episode_duration: number;
  aired_on: string;
  released_on?: string;
  next_episode_at?: string;
  season: string;
  poster: string;
  genres?: AnimeGenre[] | null;
  studios?: AnimeStudio[] | null;
  contributors?: any;
  countries: string;
  licensors: string;
  mod: number;
  banned: string;
  in_rotate: boolean;
  uhd: boolean;
  qhd: boolean;
  horizontal_poster: string;
  creditless_poster: string;
  logotype: string;
  logotype_alt: string;
  season_number: number;
  kp_id: number;
  screens?: any;
  videos?: any;
  relations?: any;
  similar?: any;
  characters?: any;
  external_links?: any;
}

export interface AnimeSelection {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user_id: string;
  title: string;
  text: string;
  mod: number;
  selectionType: "selection";
  tags: {
    id: string;
    createdAt: string;
    value: string;
  }[];
  fav_count: number;
}

// Base URLs
const ANITYPE_API_BASE = 'https://anitype.site';
const KODIK_API_BASE = 'https://kodikapi.com';
const KODIK_TOKEN = '3bd0a27dfccd284c54f4889f4a7d6453';

/**
 * Получить список аниме в ротации (главная страница)
 */
export async function getAnimeInRotate(): Promise<AnimeItem[]> {
  try {
    const response = await fetch(`${ANITYPE_API_BASE}/anime/in_rotate`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching anime in rotate:', error);
    return [];
  }
}

/**
 * Получить информацию об аниме по ID
 */
export async function getAnimeByIds(ids: number[], type: string = 's'): Promise<AnimeItem[]> {
  try {
    const idsParam = ids.join(',');
    const response = await fetch(
      `${ANITYPE_API_BASE}/anime/ids?ids=${idsParam}&type=${type}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching anime by IDs:', error);
    return [];
  }
}

/**
 * Поиск аниме по ключевому слову
 */
export async function searchAnimeByKeyword(
  keyword: string, 
  limit: number = 10, 
  page: number = 0
): Promise<AnimeSearchItem[]> {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const response = await fetch(
      `${ANITYPE_API_BASE}/anime/search?keyword=${encodedKeyword}&limit=${limit}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
}

/**
 * Получить информацию об эпизодах аниме
 */
export async function getAnimeEpisodes(animeId: number): Promise<AnimeVideo[]> {
  try {
    const response = await fetch(`${ANITYPE_API_BASE}/videos/episodes/${animeId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching anime episodes:', error);
    return [];
  }
}

/**
 * Получить все подборки аниме
 */
export async function getAnimeSelections(
  page: number = 0, 
  size: number = 10, 
  orderBy: string = 'createdAt'
): Promise<AnimeSelection[]> {
  try {
    const response = await fetch(
      `${ANITYPE_API_BASE}/selections/all?page=${page}&size=${size}&orderby=${orderBy}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching anime selections:', error);
    return [];
  }
}

/**
 * Поиск видео в Kodik API по Shikimori ID
 */
export async function getKodikVideoByShikimoriId(
  shikimoriId: number, 
  withEpisodes: boolean = true
): Promise<KodikSearchResponse> {
  try {
    const response = await fetch(
      `${KODIK_API_BASE}/search?token=${KODIK_TOKEN}&shikimori_id=${shikimoriId}&with_episodes=${withEpisodes}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Kodik video:', error);
    return { results: [] };
  }
}

/**
 * Получить список переводов для аниме
 */
export async function getAvailableTranslations(shikimoriId: number): Promise<{
  id: number;
  title: string;
  type: "voice" | "subtitles";
}[]> {
  try {
    const kodikData = await getKodikVideoByShikimoriId(shikimoriId);
    
    if (!kodikData.results.length) {
      return [];
    }
    
    // Извлекаем уникальные переводы
    const translations = new Map();
    
    kodikData.results.forEach(item => {
      const key = `${item.translation.id}-${item.translation.title}`;
      if (!translations.has(key)) {
        translations.set(key, {
          id: item.translation.id,
          title: item.translation.title,
          type: item.translation.type
        });
      }
    });
    
    return Array.from(translations.values());
  } catch (error) {
    console.error('Error fetching translations:', error);
    return [];
  }
}

/**
 * Получить ссылку на плеер для конкретного эпизода
 */
export async function getEpisodePlayerUrl(
  shikimoriId: number, 
  episode: number, 
  season: number = 1,
  translationId?: number
): Promise<string | null> {
  try {
    const kodikData = await getKodikVideoByShikimoriId(shikimoriId);
    
    if (!kodikData.results.length) {
      return null;
    }
    
    // Найти нужный перевод и эпизод
    let targetItem = kodikData.results[0];
    
    if (translationId) {
      const itemWithTranslation = kodikData.results.find(
        item => item.translation.id === translationId
      );
      if (itemWithTranslation) {
        targetItem = itemWithTranslation;
      }
    }
    
    // Получить ссылку на эпизод
    if (targetItem.seasons && targetItem.seasons[season]) {
      const seasonData = targetItem.seasons[season];
      if (seasonData.episodes && seasonData.episodes[episode]) {
        return `https:${seasonData.episodes[episode]}`;
      }
    }
    
    return `https:${targetItem.link}`;
  } catch (error) {
    console.error('Error getting episode player URL:', error);
    return null;
  }
}

/**
 * Получить популярные аниме (топ рейтинг)
 */
export async function getTopRatedAnime(limit: number = 20): Promise<AnimeSearchItem[]> {
  try {
    // Используем поиск с высоким рейтингом
    const allAnime = await searchAnimeByKeyword('', limit, 0);
    
    // Сортируем по рейтингу
    return allAnime
      .filter(anime => anime.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top rated anime:', error);
    return [];
  }
}

/**
 * Получить новые аниме (недавно вышедшие)
 */
export async function getRecentAnime(limit: number = 20): Promise<AnimeSearchItem[]> {
  try {
    const allAnime = await searchAnimeByKeyword('', limit, 0);
    
    // Сортируем по дате выхода
    return allAnime
      .filter(anime => anime.aired_on)
      .sort((a, b) => new Date(b.aired_on).getTime() - new Date(a.aired_on).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent anime:', error);
    return [];
  }
}

/**
 * Получить онгоинги (выходящие аниме)
 */
export async function getOngoingAnime(limit: number = 20): Promise<AnimeSearchItem[]> {
  try {
    const allAnime = await searchAnimeByKeyword('', limit * 2, 0);
    
    // Фильтруем только онгоинги
    return allAnime
      .filter(anime => anime.status === 'ongoing')
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching ongoing anime:', error);
    return [];
  }
}