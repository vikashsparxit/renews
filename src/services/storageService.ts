const DB_NAME = 'surinamNewsDB';
const DB_VERSION = 2;
const STORE_NAME = 'apiKeys';

interface ApiKeys {
  openai?: string;
  wordpress?: string;
  firecrawl?: string;
  wordpressSiteUrl?: string;
  autoSchedule?: boolean;
}

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    console.log('Initializing IndexedDB...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      console.log('Upgrading IndexedDB schema...');
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Delete the old store if it exists
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      
      // Create a new store
      db.createObjectStore(STORE_NAME);
    };
  });
};

export const saveApiKey = async (key: string, value: string): Promise<void> => {
  console.log(`Saving ${key} to IndexedDB...`);
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        console.log(`${key} saved successfully`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error saving ${key}:`, request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in saveApiKey:', error);
    throw error;
  }
};

export const getApiKey = async (key: string): Promise<string | null> => {
  console.log(`Retrieving ${key} from IndexedDB...`);
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        console.log(`${key} retrieved successfully`);
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`Error retrieving ${key}:`, request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getApiKey:', error);
    throw error;
  }
};

export const saveAutoSchedule = async (enabled: boolean): Promise<void> => {
  return saveApiKey('autoSchedule', enabled.toString());
};

export const getAutoSchedule = async (): Promise<boolean> => {
  const value = await getApiKey('autoSchedule');
  return value === 'true';
};