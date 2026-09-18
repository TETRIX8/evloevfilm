import { del, head, put } from '@vercel/blob';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type SavedItem = {
  id: string; title: string; type: 'movie' | 'anime'; poster: string;
  year?: number; rating?: number; description?: string; url: string; createdAt: string;
};
type HistoryItem = SavedItem & { watchedAt: string; progress?: number; episode?: number };
type UserData = { saved: SavedItem[]; history: HistoryItem[] };

function firebaseAuth() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getAuth();
}

async function userId(req: VercelRequest) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try { return (await firebaseAuth().verifyIdToken(header.slice(7))).uid; }
  catch { return null; }
}

const pathname = (uid: string) => `evloevfilm/users/${uid}.json`;
const emptyData = (): UserData => ({ saved: [], history: [] });

async function readData(uid: string): Promise<UserData> {
  try {
    const blob = await head(pathname(uid));
    const response = await fetch(blob.downloadUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);
    const value = await response.json();
    return { saved: Array.isArray(value.saved) ? value.saved : [], history: Array.isArray(value.history) ? value.history : [] };
  } catch (error: any) {
    if (error?.statusCode === 404 || error?.status === 404 || /not found/i.test(error?.message || '')) return emptyData();
    throw error;
  }
}

async function writeData(uid: string, data: UserData) {
  await put(pathname(uid), JSON.stringify(data), {
    access: 'private',
    contentType: 'application/json; charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  const uid = await userId(req);
  if (!uid) return res.status(401).json({ error: 'Необходима авторизация' });
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return res.status(503).json({ error: 'Vercel Blob не настроен: добавьте Blob store к проекту' });
  }
  try {
    if (req.method === 'GET') return res.status(200).json(await readData(uid));
    if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' });

    const body = req.body || {};
    const data = await readData(uid);
    const now = new Date().toISOString();
    if (body.action === 'save') {
      const item = { ...body.item, id: body.item.id || crypto.randomUUID(), createdAt: body.item.createdAt || now };
      data.saved = [item, ...data.saved.filter((entry) => entry.url !== item.url)];
    } else if (body.action === 'unsave') {
      data.saved = data.saved.filter((entry) => entry.id !== body.id && entry.url !== body.url);
    } else if (body.action === 'history') {
      const item = { ...body.item, id: body.item.id || crypto.randomUUID(), watchedAt: now };
      data.history = [item, ...data.history.filter((entry) => entry.url !== item.url)].slice(0, 50);
    } else if (body.action === 'progress') {
      data.history = data.history.map((entry) => entry.url === body.url ? { ...entry, progress: body.progress } : entry);
    } else if (body.action === 'clear-history') {
      data.history = [];
    } else {
      return res.status(400).json({ error: 'Неизвестное действие' });
    }
    await writeData(uid, data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('user-data blob error', error);
    return res.status(500).json({ error: 'Не удалось сохранить данные пользователя' });
  }
}
