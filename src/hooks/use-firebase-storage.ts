import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { useFirebaseAuth } from './use-firebase-auth';
import { db } from '@/integrations/firebase/config';

export interface SavedItem {
  id: string;
  title: string;
  type: 'movie' | 'anime';
  poster: string;
  year?: number;
  rating?: number;
  description?: string;
  url: string;
  createdAt: Timestamp;
}

export interface HistoryItem extends SavedItem {
  watchedAt: Timestamp;
  progress?: number;
  episode?: number;
}

type SavedInput = Omit<SavedItem, 'id' | 'createdAt'>;
type HistoryInput = Omit<HistoryItem, 'id' | 'createdAt' | 'watchedAt'>;

const savedCollection = (uid: string) => collection(db, 'users', uid, 'saved');
const historyCollection = (uid: string) => collection(db, 'users', uid, 'history');

function stableId(url: string) {
  let hash = 2166136261;
  for (let index = 0; index < url.length; index += 1) {
    hash ^= url.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `item_${(hash >>> 0).toString(16)}`;
}

function asTimestamp(value: unknown) {
  if (value instanceof Timestamp) return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return Timestamp.fromDate(value.toDate());
  }
  return Timestamp.now();
}

function normalizeSaved(id: string, value: Record<string, unknown>): SavedItem {
  return { ...value, id, createdAt: asTimestamp(value.createdAt) } as SavedItem;
}

function normalizeHistory(id: string, value: Record<string, unknown>): HistoryItem {
  return { ...value, id, createdAt: asTimestamp(value.createdAt), watchedAt: asTimestamp(value.watchedAt) } as HistoryItem;
}

export function useFirebaseStorage() {
  const { user } = useFirebaseAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [savedSnapshot, historySnapshot] = await Promise.all([
        getDocs(savedCollection(user.uid)),
        getDocs(historyCollection(user.uid)),
      ]);
      setSavedItems(savedSnapshot.docs.map((item) => normalizeSaved(item.id, item.data())).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setHistoryItems(historySnapshot.docs.map((item) => normalizeHistory(item.id, item.data())).sort((a, b) => b.watchedAt.toMillis() - a.watchedAt.toMillis()));
    } catch (error) {
      console.error('Ошибка загрузки данных Firestore:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToSaved = async (item: SavedInput) => {
    if (!user) return false;
    try {
      const createdAt = Timestamp.now();
      const id = stableId(item.url);
      await setDoc(doc(savedCollection(user.uid), id), { ...item, createdAt });
      setSavedItems((current) => [{ ...item, id, createdAt }, ...current.filter((entry) => entry.url !== item.url)]);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения избранного в Firestore:', error);
      return false;
    }
  };

  const removeFromSaved = async (id: string) => {
    if (!user) return false;
    try {
      await deleteDoc(doc(savedCollection(user.uid), id));
      setSavedItems((current) => current.filter((entry) => entry.id !== id));
      return true;
    } catch (error) {
      console.error('Ошибка удаления избранного из Firestore:', error);
      return false;
    }
  };

  const addToHistory = async (item: HistoryInput) => {
    if (!user) return false;
    try {
      const watchedAt = Timestamp.now();
      const id = stableId(item.url);
      await setDoc(doc(historyCollection(user.uid), id), { ...item, createdAt: watchedAt, watchedAt });
      setHistoryItems((current) => [{ ...item, id, createdAt: watchedAt, watchedAt }, ...current.filter((entry) => entry.url !== item.url)]);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения истории в Firestore:', error);
      return false;
    }
  };

  const clearHistory = async () => {
    if (!user) return false;
    try {
      const snapshot = await getDocs(historyCollection(user.uid));
      await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
      setHistoryItems([]);
      return true;
    } catch (error) {
      console.error('Ошибка очистки истории в Firestore:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) void load();
    else { setSavedItems([]); setHistoryItems([]); }
  }, [user, load]);

  return {
    savedItems,
    historyItems,
    loading,
    addToSaved,
    removeFromSaved,
    isSaved: (url: string) => savedItems.some((item) => item.url === url),
    addToHistory,
    clearHistory,
    loadSavedItems: load,
    loadHistoryItems: load,
  };
}
