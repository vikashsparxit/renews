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

    const client = new FirecrawlApp({ apiKey: firecrawlKey });
    
    const scrapeOptions = {
      contentSelectors: ['article', '.article-content', '.post-content', '.entry-content'],
      imageSelectors: ['img'],
      removeSelectors: ['.advertisement', '.social-share', '.comments'],
      formats: ['html' as const] // Explicitly type as const to match the expected literal type
    };

    const result = await client.crawlUrl(url, {
      limit: 1,
      scrapeOptions
    });
    
    // Type guard to check if the response has data and the expected structure
    if ('data' in result && Array.isArray(result.data) && result.data.length > 0) {
      const document = result.data[0];
      // Access the HTML content from the document
      return document.html || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error crawling article:', error);
    return null;
  }
};