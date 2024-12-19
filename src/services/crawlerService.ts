import { FirecrawlClient } from '@mendable/firecrawl-js';
import { getApiKey } from './storageService';

interface CrawlResult {
  content: string;
  images: string[];
}

export const crawlArticle = async (url: string): Promise<CrawlResult> => {
  try {
    const firecrawlKey = await getApiKey('firecrawl');
    if (!firecrawlKey) {
      throw new Error('Firecrawl API key not found');
    }

    const client = new FirecrawlClient(firecrawlKey);
    
    const scrapeOptions = {
      contentSelectors: ['article', '.article-content', '.post-content', '.entry-content'],
      imageSelectors: ['img'],
      removeSelectors: ['.advertisement', '.social-share', '.comments']
    };

    const result = await client.scrape(url, scrapeOptions);
    
    return {
      content: result.content || '',
      images: result.images || []
    };
  } catch (error) {
    console.error('Error crawling article:', error);
    throw error;
  }
}