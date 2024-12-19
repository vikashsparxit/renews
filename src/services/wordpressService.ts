import axios from 'axios';
import { toast } from "sonner";
import { getApiKey } from './storageService';

interface WordPressPost {
  title: string;
  content: string;
  status: 'publish' | 'draft';
}

export const publishToWordPress = async (article: WordPressPost) => {
  try {
    const wpApiKey = await getApiKey('wordpress');
    const wpSiteUrl = localStorage.getItem('wp_site_url');
    
    if (!wpApiKey || !wpSiteUrl) {
      toast.error('WordPress configuration missing. Please check your settings.');
      throw new Error('WordPress configuration missing');
    }

    // Construct the WordPress REST API endpoint
    const apiEndpoint = `${wpSiteUrl}/wp-json/wp/v2/posts`;
    
    const response = await axios.post(
      apiEndpoint,
      {
        title: article.title,
        content: article.content,
        status: article.status
      },
      {
        headers: {
          'Authorization': `Bearer ${wpApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      console.log('Article published to WordPress successfully');
      toast.success('Article published successfully');
      return response.data;
    } else {
      throw new Error('Failed to publish to WordPress');
    }
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    toast.error('Failed to publish to WordPress. Please check your configuration.');
    throw error;
  }
};