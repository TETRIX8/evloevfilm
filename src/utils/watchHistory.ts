import { auth } from '@/integrations/firebase/config';
import { userDataApi } from '@/services/user-data';

export interface WatchHistoryItem { title: string; image: string; link: string; lastWatched: string; progress: number; }
export const addToWatchHistory = async (movie: { title: string; image: string; link: string }) => {
  if (!auth.currentUser) return;
  await userDataApi.addHistory({ title: movie.title, poster: movie.image, url: movie.link, type: 'movie', progress: 0 });
};
export const updateWatchProgress = async (link: string, progress: number) => {
  if (!auth.currentUser) return;
  await userDataApi.updateProgress(link, progress);
};
export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
  if (!auth.currentUser) return [];
  const data = await userDataApi.get();
  return data.history.map((item) => ({ title: item.title, image: item.poster, link: item.url, lastWatched: item.watchedAt, progress: item.progress || 0 }));
};
