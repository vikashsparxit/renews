const DB_NAME = 'surinamNewsDB';
const DB_VERSION = 2;
const ARTICLE_STORE = 'articles';
const CACHE_DURATION_DAYS = 7; // Keep articles in cache for 7 days

interface CachedArticle {
  id: string;
  title: string;
  content: string;
  rewrittenContent: string;
  source: string;
  timestamp: Date;
  url: string;
  cacheDate: Date;
}

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    console.log('Initializing IndexedDB for article cache...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('Creating/upgrading article store');
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(ARTICLE_STORE)) {
        const store = db.createObjectStore(ARTICLE_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('url', 'url', { unique: true });
      }
    };
  });
};

export const saveArticleToCache = async (article: CachedArticle): Promise<void> => {
  console.log('Saving article to cache:', article.title);
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ARTICLE_STORE, 'readwrite');
    const store = transaction.objectStore(ARTICLE_STORE);
    
    const request = store.put({
      ...article,
      cacheDate: new Date(),
      timestamp: new Date(article.timestamp)
    });

    request.onsuccess = () => {
      console.log('Article cached successfully:', article.title);
      resolve();
    };

    request.onerror = () => {
      console.error('Error caching article:', request.error);
      reject(request.error);
    };
  });
};

export const getArticleFromCache = async (url: string): Promise<CachedArticle | null> => {
  console.log('Checking cache for article:', url);
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ARTICLE_STORE, 'readonly');
    const store = transaction.objectStore(ARTICLE_STORE);
    const urlIndex = store.index('url');
    const request = urlIndex.get(url);

    request.onsuccess = () => {
      if (request.result) {
        const article = request.result as CachedArticle;
        const cacheAge = new Date().getTime() - new Date(article.cacheDate).getTime();
        const maxAge = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;
        
        if (cacheAge > maxAge) {
          console.log('Cached article expired:', url);
          resolve(null);
        } else {
          console.log('Article found in cache:', article.title);
          resolve(article);
        }
      } else {
        console.log('Article not found in cache:', url);
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error('Error retrieving article from cache:', request.error);
      reject(request.error);
    };
  });
};

export const clearExpiredCache = async (): Promise<void> => {
  console.log('Clearing expired articles from cache');
  const db = await initDB();
  const maxAge = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(new Date().getTime() - maxAge);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ARTICLE_STORE, 'readwrite');
    const store = transaction.objectStore(ARTICLE_STORE);
    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const article = cursor.value as CachedArticle;
        if (new Date(article.cacheDate) < cutoffDate) {
          cursor.delete();
          console.log('Deleted expired article:', article.title);
        }
        cursor.continue();
      } else {
        console.log('Finished clearing expired cache');
        resolve();
      }
    };

    request.onerror = () => {
      console.error('Error clearing expired cache:', request.error);
      reject(request.error);
    };
  });
};