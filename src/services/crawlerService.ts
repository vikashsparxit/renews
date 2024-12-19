import FirecrawlApp from '@mendable/firecrawl-js';
import { getApiKey } from './storageService';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

type CrawlFormat = 
  | "html" 
  | "markdown" 
  | "rawHtml" 
  | "content" 
  | "links" 
  | "screenshot" 
  | "screenshot@fullPage" 
  | "extract";

interface FirecrawlDocument {
  html?: string;
  markdown?: string;
  images?: string[];
  [key: string]: any;
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
          'main',
          '#main-content',
          '.main-content',
          '.article-body',
          '.story-content',
          '.post',
          '.news-content'
        ],
        imageSelectors: [
          'img',
          '.article-image',
          '.featured-image',
          '.post-image',
          'picture source',
          '.wp-post-image',
          '.attachment-post-thumbnail'
        ],
        removeSelectors: [
          '.advertisement',
          '.social-share',
          '.comments',
          '.related-posts',
          '.sidebar',
          '.nav',
          '.navigation',
          '.menu',
          '.footer',
          '.header',
          '.ad',
          '.widget'
        ],
        formats: ["html", "markdown"] as CrawlFormat[],
        waitForSelector: 'article, .article-content, .post-content',
        includeImages: true,
        followLinks: false,
        maxDepth: 1
      };

      console.log('Crawling with Firecrawl using options:', scrapeOptions);
      const result = await client.crawlUrl(url, {
        limit: 1,
        scrapeOptions
      });

      if ('data' in result && Array.isArray(result.data) && result.data.length > 0) {
        const document = result.data[0] as FirecrawlDocument;
        console.log('Successfully crawled content with Firecrawl');
        
        // Process and embed images in the HTML content
        let processedContent = document.html || '';
        if (document.images && Array.isArray(document.images)) {
          document.images.forEach((img: string) => {
            if (!processedContent.includes(img)) {
              processedContent += `<img src="${img}" class="article-image" loading="lazy" />`;
            }
          });
        }
        
        return processedContent;
      }
    }

    // Fallback to fetch with CORS proxy
    console.log('Falling back to CORS proxy fetch for URL:', url);
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
      'main',
      '#main-content',
      '.main-content',
      '.article-body',
      '.story-content',
      '.post',
      '.news-content'
    ];
    
    // Process images
    const images = doc.querySelectorAll('img');
    const imageUrls = Array.from(images).map(img => img.src);
    console.log('Found images:', imageUrls);
    
    // Find main content
    let mainContent = null;
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        console.log('Found content using selector:', selector);
        mainContent = element;
        break;
      }
    }
    
    if (mainContent) {
      // Process the content to ensure images are properly embedded
      let processedContent = mainContent.innerHTML;
      imageUrls.forEach(imgUrl => {
        if (!processedContent.includes(imgUrl)) {
          processedContent += `<img src="${imgUrl}" class="article-image" loading="lazy" />`;
        }
      });
      
      return processedContent;
    }
    
    console.log('No content found with any selector');
    return null;
  } catch (error) {
    console.error('Error crawling article:', error);
    return null;
  }
};