import FirecrawlApp from '@mendable/firecrawl-js';
import { getApiKey } from './storageService';
import axios from 'axios';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const crawlWithFallback = async (url: string): Promise<string | null> => {
  try {
    // First try Firecrawl if API key is available
    const firecrawlContent = await crawlWithFirecrawl(url);
    if (firecrawlContent) return firecrawlContent;

    // Fallback to direct fetching with CORS proxy
    console.log('Falling back to CORS proxy for content fetching');
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`);
    const html = response.data;
    
    // Extract main content using basic DOM parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Try to find the main content area
    const mainContent = tempDiv.querySelector('article, .article, .post-content, .entry-content');
    if (mainContent) {
      return mainContent.innerHTML;
    }
    
    return null;
  } catch (error) {
    console.error('Error crawling content:', error);
    return null;
  }
};

const crawlWithFirecrawl = async (url: string): Promise<string | null> => {
  try {
    const apiKey = await getApiKey('firecrawl');
    if (!apiKey) {
      console.log('Firecrawl API key not found, skipping Firecrawl');
      return null;
    }

    const firecrawl = new FirecrawlApp({ apiKey });
    const result = await firecrawl.crawlUrl(url, {
      limit: 1,
      scrapeOptions: {
        formats: ['html'],
        selectors: {
          article: 'article, .article, .post-content, .entry-content',
          images: 'img'
        }
      }
    });

    if (result.success && result.data?.[0]) {
      const crawledData = result.data[0];
      let content = '';
      
      // Extract article content using the specified selectors
      const articleContent = crawledData.querySelector('article, .article, .post-content, .entry-content');
      if (articleContent) {
        content = articleContent.innerHTML;
      }
      
      // Process and embed images
      const images = crawledData.querySelectorAll('img');
      if (images && images.length > 0) {
        images.forEach((img: Element) => {
          const imgSrc = img.getAttribute('src');
          if (imgSrc && !content.includes(imgSrc)) {
            content = `<img src="${imgSrc}" alt="" class="my-4 max-w-full" />${content}`;
          }
        });
      }
      
      return content || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error using Firecrawl:', error);
    return null;
  }
};