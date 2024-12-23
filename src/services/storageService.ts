const DB_NAME = 'surinamNewsDB';
const DB_VERSION = 2;
const STORE_NAME = 'apiKeys';

let db: IDBDatabase | null = null;

const initDB = async (): Promise<IDBDatabase> => {
  if (db) return db;

  return new Promise((resolve, reject) => {
    console.log('Initializing IndexedDB...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      db = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      console.log('Upgrading IndexedDB schema...');
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveApiKey = async (key: string, value: string): Promise<void> => {
  console.log(`Saving ${key} to IndexedDB...`);
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
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
  });
};

export const getApiKey = async (key: string): Promise<string | null> => {
  console.log(`Retrieving ${key} from IndexedDB...`);
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
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
  });
};

export const saveAutoSchedule = async (enabled: boolean): Promise<void> => {
  return saveApiKey('autoSchedule', enabled.toString());
};

export const getAutoSchedule = async (): Promise<boolean> => {
  const value = await getApiKey('autoSchedule');
  return value === 'true';
};