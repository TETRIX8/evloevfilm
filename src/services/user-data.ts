import { auth } from '@/integrations/firebase/config';

export interface BlobSavedItem {
  id: string;
  title: string;
  type: 'movie' | 'anime';
  poster: string;
  year?: number;
  rating?: number;
  description?: string;
  url: string;
  createdAt: string;
}

export interface BlobHistoryItem extends BlobSavedItem {
  watchedAt: string;
  progress?: number;
  episode?: number;
}

export interface UserDataResponse {
  saved: BlobSavedItem[];
  history: BlobHistoryItem[];
}

async function request(body?: Record<string, unknown>): Promise<UserDataResponse> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Необходима авторизация');
  const response = await fetch('/api/user-data', {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Ошибка сохранения данных');
  return payload;
}

export const userDataApi = {
  get: () => request(),
  save: (item: Omit<BlobSavedItem, 'id' | 'createdAt'>) => request({ action: 'save', item }),
  unsave: (id: string, url: string) => request({ action: 'unsave', id, url }),
  addHistory: (item: Omit<BlobHistoryItem, 'id' | 'createdAt' | 'watchedAt'>) => request({ action: 'history', item }),
  updateProgress: (url: string, progress: number) => request({ action: 'progress', url, progress }),
  clearHistory: () => request({ action: 'clear-history' }),
};
