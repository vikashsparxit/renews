import FirecrawlApp from '@mendable/firecrawl-js';
import { getApiKey } from './storageService';

interface CrawlResult {
  content: string;
  images: string[];
}

export const crawlWithFallback = async (url: string): Promise<string | null> => {
  try {
    const firecrawlKey = await getApiKey('firecrawl');
    if (!firecrawlKey) {
      throw new Error('Firecrawl API key not found');
    }

    const client = new FirecrawlApp(firecrawlKey);
    
    const scrapeOptions = {
      contentSelectors: ['article', '.article-content', '.post-content', '.entry-content'],
      imageSelectors: ['img'],
      removeSelectors: ['.advertisement', '.social-share', '.comments']
    };

    const result = await client.scrape(url, scrapeOptions);
    
    return result.content || null;
  } catch (error) {
    console.error('Error crawling article:', error);
    return null;
  }
};