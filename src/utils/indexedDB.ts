
// IndexedDB utility for storing settings data
const DB_NAME = 'appSettings';
const DB_VERSION = 1;
const SETTINGS_STORE = 'settings';

interface DBSetting {
  key: string;
  value: string | number | boolean;
  type?: string; // To distinguish between image, video, etc.
}

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Could not open IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
  });
};

// Get a value from the database
export const getDBSetting = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result as DBSetting | undefined;
        resolve(result ? result.value as T : null);
      };
      
      request.onerror = (event) => {
        console.error('Error getting from IndexedDB:', event);
        reject('Failed to retrieve data');
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('IndexedDB operation failed:', error);
    return null;
  }
};

// Set a value in the database
export const setDBSetting = async (key: string, value: string | number | boolean, type?: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      
      const setting: DBSetting = { key, value, type };
      const request = store.put(setting);
      
      request.onsuccess = () => resolve();
      
      request.onerror = (event) => {
        console.error('Error saving to IndexedDB:', event);
        reject('Failed to save data');
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('IndexedDB operation failed:', error);
  }
};

// Delete a value from the database
export const deleteDBSetting = async (key: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      
      request.onerror = (event) => {
        console.error('Error deleting from IndexedDB:', event);
        reject('Failed to delete data');
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('IndexedDB operation failed:', error);
  }
};
