import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { useKeywordStore } from './keywordService';
import { create } from 'zustand';
import { subHours, addMinutes } from 'date-fns';
import { processArticle } from './articleService';
import { clearExpiredCache } from './articleCacheService';
import { toast } from "sonner";

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export interface RSSFeed {
  name: string;
  url: string;
  status: 'active' | 'error';
  lastUpdate: Date;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: Date;
  status: 'pending' | 'published' | 'rejected' | 'scheduled';
  url: string;
  scheduledTime?: Date;
  rewrittenContent?: string;
  isNew?: boolean;
}

interface ScheduleStore {
  interval: number;
  setInterval: (minutes: number) => void;
  lastFetch: Date | null;
  setLastFetch: (date: Date) => void;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  interval: 10,
  setInterval: (minutes) => set({ interval: minutes }),
  lastFetch: null,
  setLastFetch: (date) => set({ lastFetch: date }),
}));

const RSS_FEEDS = [
  {
    name: 'Starnieuws',
    url: 'https://www.starnieuws.com/rss/index.rss'
  },
  {
    name: 'Waterkant',
    url: 'https://www.waterkant.net/feed/'
  }
];

const containsKeyword = (text: string, keywords: Array<{ text: string, active: boolean }>) => {
  const activeKeywords = keywords.filter(k => k.active);
  const lowerText = text.toLowerCase();
  return activeKeywords.some(keyword => lowerText.includes(keyword.text.toLowerCase()));
};

const isWithinLast48Hours = (date: Date) => {
  const fortyEightHoursAgo = subHours(new Date(), 48);
  return date >= fortyEightHoursAgo;
};

export const fetchFeeds = async (): Promise<RSSFeed[]> => {
  console.log('Fetching RSS feeds...');
  useScheduleStore.getState().setLastFetch(new Date());
  
  // Clear expired cache entries
  await clearExpiredCache();
  
  const feedStatuses = await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      try {
        const response = await axios.get(`${CORS_PROXY}${feed.url}`);
        const parser = new XMLParser();
        const result = parser.parse(response.data);
        
        if (!result.rss?.channel) {
          throw new Error('Invalid RSS feed format');
        }
        
        return {
          ...feed,
          status: 'active' as const,
          lastUpdate: new Date()
        };
      } catch (error) {
        console.error(`Error checking feed ${feed.url}:`, error);
        return {
          ...feed,
          status: 'error' as const,
          lastUpdate: new Date()
        };
      }
    })
  );

  return feedStatuses;
};

export const fetchArticles = async (): Promise<Article[]> => {
  console.log('Fetching articles from the last 48 hours...');
  const parser = new XMLParser();
  const articles: Article[] = [];
  const keywords = useKeywordStore.getState().keywords;
  let scheduledTime = new Date();
  scheduledTime = addMinutes(scheduledTime, 30);

  // Get previously fetched article IDs from localStorage
  const previousArticleIds = JSON.parse(localStorage.getItem('fetchedArticleIds') || '[]');
  const newArticleIds: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching ${feed.name}`);
      const response = await axios.get(`${CORS_PROXY}${feed.url}`);
      console.log(`Successfully fetched ${feed.name}`);

      const result = parser.parse(response.data);
      const items = result.rss?.channel?.item || [];
      console.log(`Parsing ${items.length} items from ${feed.name}`);

      const feedArticles = items
        .map((item: any) => {
          const articleId = item.guid || item.link;
          const isNew = !previousArticleIds.includes(articleId);
          return {
            id: articleId,
            title: item.title,
            content: item.description || '',
            source: feed.name,
            timestamp: new Date(item.pubDate),
            status: 'pending' as const,
            url: item.link,
            isNew
          };
        })
        .filter((article: Article) => 
          isWithinLast48Hours(article.timestamp) && 
          (containsKeyword(article.title, keywords) || 
          containsKeyword(article.content, keywords))
        );

      // Process each matching article automatically
      for (const article of feedArticles) {
        try {
          console.log(`Processing article: ${article.title}`);
          const processedArticle = await processArticle(article);
          
          // Add scheduling information
          processedArticle.status = 'scheduled';
          processedArticle.scheduledTime = new Date(scheduledTime);
          scheduledTime = addMinutes(scheduledTime, 30);
          
          articles.push(processedArticle);
          newArticleIds.push(article.id);
          toast.success(`Article processed and scheduled: ${article.title}`);
        } catch (error) {
          console.error(`Error processing article: ${article.title}`, error);
          toast.error(`Failed to process article: ${article.title}`);
          articles.push(article);
        }
      }

      console.log(`Successfully processed ${feedArticles.length} matching articles from ${feed.name}`);
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
      toast.error(`Failed to fetch articles from ${feed.name}`);
    }
  }

  // Update localStorage with new article IDs
  localStorage.setItem('fetchedArticleIds', JSON.stringify([...newArticleIds]));

  // Sort articles by timestamp, newest first
  return articles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const refreshFeeds = async (): Promise<void> => {
  console.log('Manually refreshing feeds...');
  // The actual refresh will happen through the useQuery invalidation
};
