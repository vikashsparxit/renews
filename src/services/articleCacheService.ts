interface Article {
  id: string;
  title: string;
  content: string;
  rewrittenContent?: string;
  source: string;
  timestamp: Date;
  url: string;
  cacheDate: Date;
}

let db: IDBDatabase | null = null;
const DB_NAME = 'renews_cache';
const DB_VERSION = 1;
const STORE_NAME = 'articles';

const initDB = async (): Promise<void> => {
  if (db) return;

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
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBOpenDBRequest;
      const database = target.result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp');
        console.log('Article store created successfully');
      }
    };
  });
};

export const saveArticleToCache = async (article: Article): Promise<void> => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(article);

    request.onsuccess = () => {
      console.log('Article cached successfully:', article.title);
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error caching article:', event);
      reject(new Error('Failed to cache article'));
    };
  });
};

export const getArticleFromCache = async (url: string): Promise<Article | undefined> => {
  await initDB();

  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(url);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('Error retrieving article from cache:', event);
      reject(new Error('Failed to retrieve article from cache'));
    };
  });
};

export const clearExpiredCache = async (): Promise<void> => {
  await initDB();

  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const article = cursor.value as Article;
        if (now - new Date(article.cacheDate).getTime() > TWO_DAYS) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        console.log('Cache cleanup completed');
        resolve();
      }
    };

    request.onerror = (event) => {
      console.error('Error clearing expired cache:', event);
      reject(new Error('Failed to clear expired cache'));
    };
  });
};