import { Article } from './articleService';

interface CachedArticle {
  id: string;
  title: string;
  content: string;
  rewrittenContent?: string;
  source: string;
  timestamp: Date;
  url: string;
  cacheDate: Date;
}

const DB_NAME = 'surinamNewsDB';
const STORE_NAME = 'articles';

let db: IDBDatabase | null = null;

const getStore = async (mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const transaction = db.transaction(STORE_NAME, mode);
  return transaction.objectStore(STORE_NAME);
};

export const saveArticleToCache = async (article: CachedArticle): Promise<void> => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  return new Promise((resolve, reject) => {
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
  if (!db) {
    throw new Error('Database not initialized');
  }

  return new Promise((resolve, reject) => {
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
  if (!db) {
    throw new Error('Database not initialized');
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const article = cursor.value as CachedArticle;
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