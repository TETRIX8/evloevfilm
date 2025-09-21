import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { useFirebaseAuth } from './use-firebase-auth';

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

export interface HistoryItem {
  id: string;
  title: string;
  type: 'movie' | 'anime';
  poster: string;
  year?: number;
  rating?: number;
  description?: string;
  url: string;
  watchedAt: Timestamp;
  progress?: number; // для аниме - прогресс просмотра
  episode?: number; // для аниме - номер серии
}

export function useFirebaseStorage() {
  const { user } = useFirebaseAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузить избранное
  const loadSavedItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const savedRef = collection(db, 'users', user.uid, 'saved');
      const q = query(savedRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedItem[];
      
      setSavedItems(items);
    } catch (error: any) {
      console.error('Error loading saved items:', error);
      // Если ошибка связана с правами доступа, показываем более понятное сообщение
      if (error.code === 'permission-denied') {
        console.warn('Firestore rules not configured. Please set up Firestore security rules.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузить историю
  const loadHistoryItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const historyRef = collection(db, 'users', user.uid, 'history');
      const q = query(historyRef, orderBy('watchedAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      
      setHistoryItems(items);
    } catch (error: any) {
      console.error('Error loading history items:', error);
      // Если ошибка связана с правами доступа, показываем более понятное сообщение
      if (error.code === 'permission-denied') {
        console.warn('Firestore rules not configured. Please set up Firestore security rules.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Добавить в избранное
  const addToSaved = async (item: Omit<SavedItem, 'id' | 'createdAt'>) => {
    if (!user) return false;
    
    try {
      const savedRef = collection(db, 'users', user.uid, 'saved');
      
      // Фильтруем undefined значения
      const cleanItem = Object.fromEntries(
        Object.entries({
          ...item,
          createdAt: Timestamp.now()
        }).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(savedRef, cleanItem);
      
      // Обновляем локальное состояние
      const newItem: SavedItem = {
        id: docRef.id,
        ...item,
        createdAt: Timestamp.now()
      };
      setSavedItems(prev => [newItem, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Error adding to saved:', error);
      return false;
    }
  };

  // Удалить из избранного
  const removeFromSaved = async (itemId: string) => {
    if (!user) return false;
    
    try {
      const savedRef = doc(db, 'users', user.uid, 'saved', itemId);
      await deleteDoc(savedRef);
      
      // Обновляем локальное состояние
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
      
      return true;
    } catch (error) {
      console.error('Error removing from saved:', error);
      return false;
    }
  };

  // Проверить, есть ли в избранном
  const isSaved = (url: string) => {
    return savedItems.some(item => item.url === url);
  };

  // Добавить в историю
  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'watchedAt'>) => {
    if (!user) return false;
    
    try {
      const historyRef = collection(db, 'users', user.uid, 'history');
      
      // Фильтруем undefined значения
      const cleanItem = Object.fromEntries(
        Object.entries({
          ...item,
          watchedAt: Timestamp.now()
        }).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = await addDoc(historyRef, cleanItem);
      
      // Обновляем локальное состояние
      const newItem: HistoryItem = {
        id: docRef.id,
        ...item,
        watchedAt: Timestamp.now()
      };
      setHistoryItems(prev => [newItem, ...prev]);
      
      return true;
    } catch (error) {
      console.error('Error adding to history:', error);
      return false;
    }
  };

  // Очистить историю
  const clearHistory = async () => {
    if (!user) return false;
    
    try {
      const historyRef = collection(db, 'users', user.uid, 'history');
      const querySnapshot = await getDocs(historyRef);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setHistoryItems([]);
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  };

  // Загрузить данные при изменении пользователя
  useEffect(() => {
    if (user) {
      loadSavedItems();
      loadHistoryItems();
    } else {
      setSavedItems([]);
      setHistoryItems([]);
    }
  }, [user]);

  return {
    savedItems,
    historyItems,
    loading,
    addToSaved,
    removeFromSaved,
    isSaved,
    addToHistory,
    clearHistory,
    loadSavedItems,
    loadHistoryItems
  };
}
