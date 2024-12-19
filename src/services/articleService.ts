import { toast } from "sonner";
import { getApiKey } from './storageService';
import { getArticleFromCache, saveArticleToCache } from './articleCacheService';
import { crawlWithFallback } from './crawlerService';
import { publishToWordPress } from './wordpressService';

export interface Article {
  id: string;
  title: string;
  content: string;
  rewrittenContent?: string;
  source: string;
  timestamp: Date;
  status: 'pending' | 'published' | 'rejected' | 'scheduled';
  url: string;
  scheduledTime?: Date;
  isNew?: boolean;
}

export const processArticle = async (article: Article): Promise<Article> => {
  console.log('Processing article:', article.title);
  
  try {
    // Check cache first
    const cachedArticle = await getArticleFromCache(article.url);
    if (cachedArticle) {
      console.log('Using cached version of article:', article.title);
      return {
        ...article,
        content: cachedArticle.content,
        rewrittenContent: cachedArticle.rewrittenContent,
        status: 'scheduled'
      };
    }

    // If not in cache, process the article
    console.log('Article not in cache, processing:', article.title);
    
    // First, crawl the full content
    const fullContent = await crawlWithFallback(article.url);
    if (fullContent) {
      article.content = fullContent;
    }
    
    // Then rewrite the content using OpenAI
    const apiKey = await getApiKey('openai');
    if (!apiKey) {
      toast.error('OpenAI API key not found. Please add your API key in the settings.');
      throw new Error('OpenAI API key not found');
    }

    // Save to cache
    await saveArticleToCache({
      id: article.id,
      title: article.title,
      content: article.content,
      source: article.source,
      timestamp: article.timestamp,
      url: article.url,
      cacheDate: new Date()
    });
    
    return {
      ...article,
      status: 'scheduled'
    };
  } catch (error) {
    console.error('Error processing article:', error);
    throw error;
  }
};