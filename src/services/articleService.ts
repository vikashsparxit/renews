import axios from 'axios';
import { Article } from './rssService';
import { toast } from "sonner";
import { getApiKey } from './storageService';
import FirecrawlApp from '@mendable/firecrawl-js';

const WP_API_ENDPOINT = 'https://www.surinamnews.com/wp-json/wp/v2';

export const processArticle = async (article: Article): Promise<Article> => {
  console.log('Processing article:', article.title);
  
  try {
    // First, crawl the full content from the URL
    const fullContent = await crawlArticleContent(article.url);
    if (fullContent) {
      article.content = fullContent;
    }
    
    // Then rewrite the content
    const rewrittenContent = await rewriteArticle(article.content);
    console.log('Article rewritten successfully');
    
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

const crawlArticleContent = async (url: string): Promise<string | null> => {
  try {
    console.log('Crawling full content from:', url);
    const apiKey = await getApiKey('firecrawl');
    
    if (!apiKey) {
      console.log('Firecrawl API key not found, using RSS content');
      return null;
    }

    const firecrawl = new FirecrawlApp({ apiKey });
    const result = await firecrawl.crawlUrl(url, {
      limit: 1,
      scrapeOptions: {
        formats: ['html'],
      }
    });

    if (result.success && result.data?.[0]?.content) {
      return result.data[0].content;
    }
    
    return null;
  } catch (error) {
    console.error('Error crawling article content:', error);
    return null;
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
        model: 'gpt-4o',
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
    
    return response.data.choices[0].message.content;
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

export const publishToWordPress = async (article: { 
  title: string; 
  content: string; 
  status: 'publish' | 'draft' 
}) => {
  try {
    const wpApiKey = await getApiKey('wordpress');
    
    if (!wpApiKey) {
      toast.error('WordPress API key not found. Please add your API key in the settings.');
      throw new Error('WordPress API key not found');
    }

    await axios.post(
      `${WP_API_ENDPOINT}/posts`,
      article,
      {
        headers: {
          'Authorization': `Bearer ${wpApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Article published to WordPress');
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    throw new Error('Failed to publish to WordPress');
  }
};