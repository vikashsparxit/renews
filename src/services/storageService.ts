const DB_NAME = 'surinamNewsDB';
const DB_VERSION = 4; // Incrementing version to force upgrade
const API_KEYS_STORE = 'apiKeys';
const ARTICLE_STORE = 'articles';

let db: IDBDatabase | null = null;

const initDB = async (): Promise<IDBDatabase> => {
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
      const target = event.target as IDBOpenDBRequest;
      const database = target.result;

      // Delete existing stores if they exist
      if (database.objectStoreNames.contains(API_KEYS_STORE)) {
        database.deleteObjectStore(API_KEYS_STORE);
      }
      if (database.objectStoreNames.contains(ARTICLE_STORE)) {
        database.deleteObjectStore(ARTICLE_STORE);
      }
      
      // Create stores
      database.createObjectStore(API_KEYS_STORE);
      console.log('Created apiKeys store successfully');
      
      const articleStore = database.createObjectStore(ARTICLE_STORE, { keyPath: 'url' });
      articleStore.createIndex('timestamp', 'timestamp');
      console.log('Created articles store successfully');
    };
  });
};

const getStore = async (storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> => {
  if (!db) {
    db = await initDB();
  }
  
  try {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  } catch (error) {
    console.error(`Error getting store ${storeName}:`, error);
    // Re-initialize database if transaction fails
    db = await initDB();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }
};

export const saveApiKey = async (key: string, value: string): Promise<void> => {
  console.log(`Attempting to save ${key} to IndexedDB...`);
  try {
    const store = await getStore(API_KEYS_STORE, 'readwrite');
    
    return new Promise((resolve, reject) => {
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
    const store = await getStore(API_KEYS_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
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