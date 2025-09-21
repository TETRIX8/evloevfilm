
import { supabase } from "@/integrations/supabase/client";

export interface KodikTranslation {
  id: number;
  title: string;
  type: "voice" | "subtitles";
  is_voice: boolean;
}

export interface KodikEpisode {
  link: string;
  title?: string;
  screenshots?: string[];
}

export interface KodikSeason {
  link: string;
  episodes: Record<string, KodikEpisode>;
}

export interface KodikMaterialData {
  title: string;
  title_en?: string;
  anime_title?: string;
  other_titles?: string[];
  other_titles_en?: string[];
  other_titles_jp?: string[];
  anime_kind?: string;
  all_status?: string;
  anime_status?: string;
  description?: string;
  anime_description?: string;
  poster_url?: string;
  anime_poster_url?: string;
  screenshots?: string[];
  duration?: number;
  all_genres?: string[];
  anime_genres?: string[];
  shikimori_rating?: number;
}

export interface KodikAnimeItem {
  id: string;
  type: string;
  link: string;
  title: string;
  title_orig?: string;
  other_title?: string;
  year?: number;
  last_season?: number;
  last_episode?: number;
  episodes_count?: number;
  kinopoisk_id?: string;
  shikimori_id?: string;
  imdb_id?: string;
  quality?: string;
  camrip?: boolean;
  lgbt?: boolean;
  blocked_countries?: string[];
  created_at?: string;
  updated_at?: string;
  screenshots?: string[];
  translation: KodikTranslation;
  seasons?: Record<string, KodikSeason>;
  material_data?: KodikMaterialData;
}

export interface KodikResponse {
  total: number;
  time: string;
  results: KodikAnimeItem[];
}

// Deduplicate results by stable identifiers (prefer shikimori/kinopoisk/imdb, then title+year)
function dedupeKodikResults(results: KodikAnimeItem[]): KodikAnimeItem[] {
  const map = new Map<string, KodikAnimeItem>();
  for (const item of results) {
    const key =
      item.shikimori_id ||
      item.kinopoisk_id ||
      item.imdb_id ||
      (item.material_data?.title_en && item.year
        ? `${item.material_data.title_en}:${item.year}`
        : `${item.title}:${item.year ?? ''}`);
    const k = String(key);
    if (!map.has(k)) {
      map.set(k, item);
    } else {
      const prev = map.get(k)!;
      const prevEpisodes = prev.episodes_count ?? 0;
      const currEpisodes = item.episodes_count ?? 0;
      const pick = currEpisodes > prevEpisodes ? item : prev;
      map.set(k, pick);
    }
  }
  return Array.from(map.values());
}

export async function fetchAnimeList(limit: number = 50): Promise<KodikResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('kodik-proxy', {
      body: {
        endpoint: 'list',
        params: {
          types: 'anime,anime-serial',
          limit,
          with_material_data: true,
          with_seasons: true,
          sort: 'updated_at',
          order: 'desc'
        }
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data received from kodik-proxy');
      return { total: 0, time: "0", results: [] };
    }
    
    console.log('Kodik API response:', data);
    const resp = data as KodikResponse;
    return { ...resp, results: dedupeKodikResults(resp.results) };
  } catch (error) {
    console.error('Error fetching anime list:', error);
    return { total: 0, time: "0", results: [] };
  }
}

export async function searchAnime(query: string, limit: number = 20): Promise<KodikResponse> {
  console.log('🔍 Starting search for:', query);
  
  if (!query.trim()) {
    console.log('❌ Empty query, returning empty results');
    return { total: 0, time: "0", results: [] };
  }

  try {
    console.log('📡 Calling kodik-proxy with params:', {
      endpoint: 'search',
      title: query.trim(),
      types: 'anime,anime-serial',
      limit
    });
    
    const { data, error } = await supabase.functions.invoke('kodik-proxy', {
      body: {
        endpoint: 'search',
        params: {
          title: query.trim(),
          types: 'anime,anime-serial',
          limit,
          with_material_data: true,
          with_seasons: true,
        }
      }
    });
    
    if (error) {
      console.error('❌ Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('❌ No data received from search');
      return { total: 0, time: "0", results: [] };
    }
    
    console.log('✅ Search response received:', data);
    console.log('📊 Results count:', data.results?.length || 0);
    
    const resp = data as KodikResponse;
    const deduped = dedupeKodikResults(resp.results);
    console.log('🔄 After deduplication:', deduped.length);
    
    return { ...resp, results: deduped };
  } catch (error) {
    console.error('❌ Error searching anime:', error);
    return { total: 0, time: "0", results: [] };
  }
}

export async function getAnimeByGenres(genres: string[], limit: number = 30): Promise<KodikResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('kodik-proxy', {
      body: {
        endpoint: 'list',
        params: {
          types: 'anime,anime-serial',
          anime_genres: genres.join(','),
          limit,
          with_material_data: true,
          sort: 'shikimori_rating',
          order: 'desc'
        }
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data received from genre search');
      return { total: 0, time: "0", results: [] };
    }
    
    const resp = data as KodikResponse;
    return { ...resp, results: dedupeKodikResults(resp.results) };
  } catch (error) {
    console.error('Error fetching anime by genres:', error);
    return { total: 0, time: "0", results: [] };
  }
}

export async function getTopAnime(limit: number = 30): Promise<KodikResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('kodik-proxy', {
      body: {
        endpoint: 'list',
        params: {
          types: 'anime,anime-serial',
          shikimori_rating: '8.0',
          limit,
          with_material_data: true,
          sort: 'shikimori_rating',
          order: 'desc'
        }
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data received from top anime');
      return { total: 0, time: "0", results: [] };
    }
    
    const resp = data as KodikResponse;
    return { ...resp, results: dedupeKodikResults(resp.results) };
  } catch (error) {
    console.error('Error fetching top anime:', error);
    return { total: 0, time: "0", results: [] };
  }
}
