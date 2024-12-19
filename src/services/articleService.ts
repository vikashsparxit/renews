import { Article } from './rssService';
import { useKeywordStore } from './keywordService';
import axios from 'axios';
import { toast } from "sonner";

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const WP_API_ENDPOINT = 'https://www.surinamnews.com/wp-json/wp/v2';

export const processArticle = async (article: Article): Promise<Article> => {
  // Check if article matches any active keywords
  const activeKeywords = useKeywordStore.getState().keywords.filter(k => k.active);
  const matchesKeywords = activeKeywords.some(keyword => 
    article.title.toLowerCase().includes(keyword.text.toLowerCase()) ||
    article.content.toLowerCase().includes(keyword.text.toLowerCase())
  );

  if (!matchesKeywords) {
    console.log('Article does not match any active keywords:', article.title);
    return { ...article, status: 'rejected' };
  }

  try {
    // Rewrite article using OpenAI
    const rewrittenContent = await rewriteArticle(article.content);
    
    // If approved, publish to WordPress
    if (article.status === 'published') {
      await publishToWordPress({
        title: article.title,
        content: rewrittenContent,
        status: 'publish'
      });
      toast.success('Article published successfully');
    }

    return {
      ...article,
      content: rewrittenContent
    };
  } catch (error) {
    console.error('Error processing article:', error);
    toast.error('Failed to process article');
    return article;
  }
};

const rewriteArticle = async (content: string): Promise<string> => {
  try {
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional news editor. Rewrite the following article to avoid plagiarism while maintaining the original meaning, tone, and structure. Do not add or remove information.'
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error rewriting article:', error);
    throw new Error('Failed to rewrite article');
  }
};

const publishToWordPress = async (article: { 
  title: string; 
  content: string; 
  status: 'publish' | 'draft' 
}) => {
  try {
    await axios.post(
      `${WP_API_ENDPOINT}/posts`,
      article,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    throw new Error('Failed to publish to WordPress');
  }
};