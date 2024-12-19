import axios from 'axios';
import { Article } from './rssService';
import { toast } from "sonner";

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const WP_API_ENDPOINT = 'https://www.surinamnews.com/wp-json/wp/v2';

export const processArticle = async (article: Article): Promise<Article> => {
  console.log('Processing article:', article.title);
  
  try {
    // Rewrite article using OpenAI
    const rewrittenContent = await rewriteArticle(article.content);
    console.log('Article rewritten successfully');
    
    // If approved, publish to WordPress
    if (article.status === 'published') {
      await publishToWordPress({
        title: article.title,
        content: rewrittenContent,
        status: 'publish'
      });
      console.log('Article published to WordPress successfully');
      toast.success('Article published successfully');
    }

    return {
      ...article,
      content: rewrittenContent
    };
  } catch (error) {
    console.error('Error processing article:', error);
    toast.error('Failed to process article');
    throw error;
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

    console.log('OpenAI API response received');
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
    console.log('Article published to WordPress');
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    throw new Error('Failed to publish to WordPress');
  }
};