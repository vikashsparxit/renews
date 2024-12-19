import FirecrawlApp from '@mendable/firecrawl-js';
import { getApiKey } from './storageService';
import axios from 'axios';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface CrawlResult {
  success: boolean;
  data: string | null;
  error?: string;
}

export const crawlWithFallback = async (url: string): Promise<string | null> => {
  try {
    // Check preferred crawling method
    const preferredMethod = localStorage.getItem('crawling_method') || 'firecrawl';
    
    if (preferredMethod === 'firecrawl') {
      console.log('Attempting to crawl with Firecrawl...');
      const firecrawlContent = await crawlWithFirecrawl(url);
      if (firecrawlContent) return firecrawlContent;
    }

    // Fallback to CORS proxy
    console.log('Falling back to CORS proxy for content fetching');
    return await crawlWithCorsProxy(url);
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
        selectors: ['article', '.article', '.post-content', '.entry-content', 'img']
      }
    });

    if (result.success && result.data?.[0]) {
      const crawledData = result.data[0];
      let content = crawledData.html || '';
      
      // If no content was found, return null
      if (!content.trim()) {
        return null;
      }
      
      return content;
    }
    
    return null;
  } catch (error) {
    console.error('Error using Firecrawl:', error);
    return null;
  }
};

const crawlWithCorsProxy = async (url: string): Promise<string | null> => {
  try {
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`);
    const html = response.data;
    
    // Create a temporary element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to find the main content area
    const selectors = ['article', '.article', '.post-content', '.entry-content'];
    let content: string | null = null;
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        content = element.innerHTML;
        break;
      }
    }
    
    // If no content was found with selectors, use the body content
    if (!content) {
      content = doc.body.innerHTML;
    }
    
    // Process images to ensure they have absolute URLs
    const baseUrl = new URL(url);
    content = content.replace(/src="\/([^"]*)"/g, `src="${baseUrl.origin}/$1"`);
    
    return content;
  } catch (error) {
    console.error('Error using CORS proxy:', error);
    return null;
  }
};