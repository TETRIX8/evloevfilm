import { useEffect, useState } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { userDataApi, type BlobHistoryItem, type BlobSavedItem } from '@/services/user-data';

export class BlobTimestamp {
  constructor(private readonly value: string) {}
  toDate() { return new Date(this.value); }
  toJSON() { return this.value; }
}
export interface SavedItem extends Omit<BlobSavedItem, 'createdAt'> { createdAt: BlobTimestamp; }
export interface HistoryItem extends Omit<BlobHistoryItem, 'createdAt' | 'watchedAt'> { createdAt: BlobTimestamp; watchedAt: BlobTimestamp; }
const asSaved = (item: BlobSavedItem): SavedItem => ({ ...item, createdAt: new BlobTimestamp(item.createdAt) });
const asHistory = (item: BlobHistoryItem): HistoryItem => ({ ...item, createdAt: new BlobTimestamp(item.createdAt), watchedAt: new BlobTimestamp(item.watchedAt) });

export function useFirebaseStorage() {
  const { user } = useFirebaseAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    if (!user) return;
    setLoading(true);
    try { const data = await userDataApi.get(); setSavedItems(data.saved.map(asSaved)); setHistoryItems(data.history.map(asHistory)); }
    catch (error) { console.error('Ошибка загрузки данных Vercel Blob:', error); }
    finally { setLoading(false); }
  };
  const addToSaved = async (item: Omit<SavedItem, 'id' | 'createdAt'>) => {
    if (!user) return false;
    try { const data = await userDataApi.save(item); setSavedItems(data.saved.map(asSaved)); return true; }
    catch (error) { console.error(error); return false; }
  };
  const removeFromSaved = async (id: string) => {
    if (!user) return false;
    try { const item = savedItems.find((entry) => entry.id === id); const data = await userDataApi.unsave(id, item?.url || ''); setSavedItems(data.saved.map(asSaved)); return true; }
    catch (error) { console.error(error); return false; }
  };
  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'createdAt' | 'watchedAt'>) => {
    if (!user) return false;
    try { const data = await userDataApi.addHistory(item); setHistoryItems(data.history.map(asHistory)); return true; }
    catch (error) { console.error(error); return false; }
  };
  const clearHistory = async () => {
    if (!user) return false;
    try { await userDataApi.clearHistory(); setHistoryItems([]); return true; }
    catch (error) { console.error(error); return false; }
  };
  useEffect(() => { if (user) void load(); else { setSavedItems([]); setHistoryItems([]); } }, [user?.uid]);
  return { savedItems, historyItems, loading, addToSaved, removeFromSaved, isSaved: (url: string) => savedItems.some((item) => item.url === url), addToHistory, clearHistory, loadSavedItems: load, loadHistoryItems: load };
}
