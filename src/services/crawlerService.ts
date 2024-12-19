import FirecrawlApp from '@mendable/firecrawl-js';
import { getApiKey } from './storageService';

interface CrawlResult {
  content: string;
  images: string[];
}

export const crawlWithFallback = async (url: string): Promise<string | null> => {
  try {
    console.log('Starting crawl for URL:', url);
    const firecrawlKey = await getApiKey('firecrawl');
    
    if (firecrawlKey) {
      const client = new FirecrawlApp({ apiKey: firecrawlKey });
      
      const scrapeOptions = {
        contentSelectors: [
          'article',
          '.article-content',
          '.post-content',
          '.entry-content',
          '.content',
          'main'
        ],
        imageSelectors: ['img'],
        removeSelectors: [
          '.advertisement',
          '.social-share',
          '.comments',
          '.related-posts',
          '.sidebar'
        ],
        formats: ['html']
      };

      console.log('Crawling with Firecrawl using options:', scrapeOptions);
      const result = await client.crawlUrl(url, {
        limit: 1,
        scrapeOptions
      });

      if ('data' in result && Array.isArray(result.data) && result.data.length > 0) {
        const document = result.data[0];
        console.log('Successfully crawled content with Firecrawl');
        return document.html || null;
      }
    }

    // Fallback to fetch
    console.log('Falling back to direct fetch for URL:', url);
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic HTML parsing to extract content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to find the main content
    const selectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main'
    ];
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        console.log('Found content using selector:', selector);
        return element.innerHTML;
      }
    }
    
    console.log('No content found with any selector');
    return null;
  } catch (error) {
    console.error('Error crawling article:', error);
    return null;
  }
};