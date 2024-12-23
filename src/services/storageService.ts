const DB_NAME = 'surinamNewsDB';
const DB_VERSION = 2;
const STORE_NAME = 'apiKeys';

let db: IDBDatabase | null = null;

const initDB = async (): Promise<IDBDatabase> => {
  if (db) return db;

  return new Promise((resolve, reject) => {
    console.log('Initializing IndexedDB...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBOpenDBRequest;
      db = target.result;
      console.log('IndexedDB opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log('Upgrading IndexedDB schema...');
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Delete existing store if it exists
      if (database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME);
      }
      
      // Create new store
      database.createObjectStore(STORE_NAME);
      console.log('Created apiKeys store successfully');
    };
  });
};

export const saveApiKey = async (key: string, value: string): Promise<void> => {
  console.log(`Attempting to save ${key} to IndexedDB...`);
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      transaction.onerror = (event) => {
        console.error(`Transaction error while saving ${key}:`, event);
        reject(new Error('Failed to save API key'));
      };
      
      const request = store.put(value, key);
      
      request.onsuccess = () => {
        console.log(`Successfully saved ${key} to IndexedDB`);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error saving ${key}:`, event);
        reject(new Error('Failed to save API key'));
      };
    });
  } catch (error) {
    console.error('Error in saveApiKey:', error);
    throw error;
  }
};

export const getApiKey = async (key: string): Promise<string | null> => {
  console.log(`Attempting to retrieve ${key} from IndexedDB...`);
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      transaction.onerror = (event) => {
        console.error(`Transaction error while retrieving ${key}:`, event);
        reject(new Error('Failed to retrieve API key'));
      };
      
      request.onsuccess = () => {
        console.log(`Successfully retrieved ${key} from IndexedDB`);
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving ${key}:`, event);
        reject(new Error('Failed to retrieve API key'));
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