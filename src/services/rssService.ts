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

// Move RSS feeds to store to make them configurable
interface FeedStore {
  feeds: RSSFeed[];
  addFeed: (feed: Omit<RSSFeed, 'status' | 'lastUpdate'>) => void;
  removeFeed: (url: string) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  feeds: [],
  addFeed: (feed) => set((state) => ({
    feeds: [...state.feeds, { ...feed, status: 'active', lastUpdate: new Date() }]
  })),
  removeFeed: (url) => set((state) => ({
    feeds: state.feeds.filter(f => f.url !== url)
  }))
}));

export interface Article {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: Date;
  status: 'pending' | 'published' | 'rejected' | 'scheduled' | 'error';
  url: string;
  scheduledTime?: Date;
  rewrittenContent?: string;
  isNew?: boolean;
  error?: string;
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
  
  const configuredFeeds = useFeedStore.getState().feeds;
  if (!configuredFeeds.length) {
    console.log('No RSS feeds configured');
    return [];
  }
  
  const feedStatuses = await Promise.all(
    configuredFeeds.map(async (feed) => {
      try {
        console.log(`Fetching ${feed.name}`);
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
  const configuredFeeds = useFeedStore.getState().feeds;
  
  if (!configuredFeeds.length) {
    console.log('No RSS feeds configured');
    return [];
  }

  const parser = new XMLParser();
  const articles: Article[] = [];
  const keywords = useKeywordStore.getState().keywords;
  let scheduledTime = new Date();
  scheduledTime = addMinutes(scheduledTime, 30);

  // Get previously fetched article IDs from localStorage
  const previousArticleIds = JSON.parse(localStorage.getItem('fetchedArticleIds') || '[]');
  const newArticleIds: string[] = [];

  for (const feed of configuredFeeds) {
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
            status: 'scheduled' as const,
            url: item.link,
            isNew,
            scheduledTime: new Date(scheduledTime)
          };
        })
        .filter((article: Article) => 
          isWithinLast48Hours(article.timestamp) && 
          (containsKeyword(article.title, keywords) || 
          containsKeyword(article.content, keywords))
        );

      // Add articles to the list immediately
      articles.push(...feedArticles);
      
      // Process each matching article in the background
      feedArticles.forEach(async (article) => {
        try {
          console.log(`Processing article in background: ${article.title}`);
          const processedArticle = await processArticle(article);
          
          // Update the article in the list with the processed content
          const index = articles.findIndex(a => a.id === article.id);
          if (index !== -1) {
            articles[index] = {
              ...articles[index],
              ...processedArticle
            };
          }
          
          newArticleIds.push(article.id);
          toast.success(`Article processed: ${article.title}`);
        } catch (error) {
          console.error(`Error processing article: ${article.title}`, error);
          toast.error(`Failed to process article: ${article.title}`);
          
          // Update the article to show the error state
          const index = articles.findIndex(a => a.id === article.id);
          if (index !== -1) {
            articles[index] = {
              ...articles[index],
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to process article'
            };
          }
        }
      });

      console.log(`Successfully added ${feedArticles.length} matching articles from ${feed.name}`);
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
