import { auth, db } from '@/integrations/firebase/config';
import { collection, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore';

export interface WatchHistoryItem { title: string; image: string; link: string; lastWatched: string; progress: number; }

function historyRef(uid: string, link: string) {
  let hash = 2166136261;
  for (let index = 0; index < link.length; index += 1) {
    hash ^= link.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return doc(collection(db, 'users', uid, 'history'), `item_${(hash >>> 0).toString(16)}`);
}

export const addToWatchHistory = async (movie: { title: string; image: string; link: string }) => {
  const user = auth.currentUser;
  if (!user) return;
  const watchedAt = Timestamp.now();
  await setDoc(historyRef(user.uid, movie.link), {
    title: movie.title,
    poster: movie.image,
    url: movie.link,
    type: 'movie',
    progress: 0,
    createdAt: watchedAt,
    watchedAt,
  }, { merge: true });
};

export const updateWatchProgress = async (link: string, progress: number) => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(historyRef(user.uid, link), { progress, watchedAt: Timestamp.now() }, { merge: true });
};

export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
  const user = auth.currentUser;
  if (!user) return [];
  const snapshot = await getDocs(collection(db, 'users', user.uid, 'history'));
  return snapshot.docs.map((item) => {
    const data = item.data();
    const watchedAt = data.watchedAt as Timestamp | undefined;
    return { title: String(data.title || ''), image: String(data.poster || ''), link: String(data.url || ''), lastWatched: watchedAt?.toDate().toISOString() || '', progress: Number(data.progress || 0) };
  });
};
