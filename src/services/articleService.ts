import axios from 'axios';
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
    
    // Then rewrite the content
    const rewrittenContent = await rewriteArticle(article.content);
    console.log('Article rewritten successfully');
    
    // Save to cache
    await saveArticleToCache({
      id: article.id,
      title: article.title,
      content: article.content,
      rewrittenContent,
      source: article.source,
      timestamp: article.timestamp,
      url: article.url,
      cacheDate: new Date()
    });
    
    return {
      ...article,
      rewrittenContent,
      status: 'scheduled'
    };
  } catch (error) {
    console.error('Error processing article:', error);
    throw error;
  }
};

const rewriteArticle = async (content: string): Promise<string> => {
  try {
    console.log('Starting article rewrite with OpenAI');
    const apiKey = await getApiKey('openai');
    
    if (!apiKey) {
      toast.error('OpenAI API key not found. Please add your API key in the settings.');
      throw new Error('OpenAI API key not found');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are tasked with rephrasing content to make it plagiarism-free while strictly maintaining the original tone, structure, and meaning. Your goal is to rewrite the text so that:
1. The structure of the original sentences is preserved.
2. No additional information is added, and no existing details are removed.
3. The rewritten content uses different words and phrases while retaining the same style and tone.`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }
    
    // Preserve images from original content
    const images = content.match(/<img[^>]+>/g) || [];
    let rewrittenContent = response.data.choices[0].message.content;
    
    // Add preserved images back to the rewritten content
    images.forEach(img => {
      rewrittenContent = img + '\n' + rewrittenContent;
    });
    
    return rewrittenContent;
  } catch (error) {
    console.error('Error rewriting article:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      toast.error('Invalid OpenAI API key. Please check your API key in the settings.');
    } else {
      toast.error('Failed to rewrite article. Please try again later.');
    }
    throw error;
  }
};