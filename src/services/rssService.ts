import { create } from 'zustand';
import { subHours, addMinutes } from 'date-fns';
import { processArticle } from './articleService';
import { clearExpiredCache } from './articleCacheService';
import { toast } from "sonner";
import { useFeedStore, fetchFeedContent } from './feedUtils';
import { checkArticleKeywords } from './keywordUtils';
import { Article } from './types';

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

const isWithinLast48Hours = (date: Date) => {
  const fortyEightHoursAgo = subHours(new Date(), 48);
  return date >= fortyEightHoursAgo;
};

export const fetchFeeds = async () => {
  console.log('Fetching RSS feeds...');
  useScheduleStore.getState().setLastFetch(new Date());
  
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
        const result = await fetchFeedContent(feed.url);
        
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

  const articles: Article[] = [];
  const previousArticleIds = JSON.parse(localStorage.getItem('fetchedArticleIds') || '[]');
  const newArticleIds: string[] = [];
  let scheduledTime = addMinutes(new Date(), 30);

  for (const feed of configuredFeeds) {
    try {
      console.log(`Fetching ${feed.name}`);
      const result = await fetchFeedContent(feed.url);
      console.log(`Successfully fetched ${feed.name}`);

      const items = result.rss?.channel?.item || [];
      console.log(`Found ${items.length} items in ${feed.name}`);

      for (const item of items) {
        const articleId = item.guid || item.link;
        const isNew = !previousArticleIds.includes(articleId);
        const article = {
          id: articleId,
          title: item.title,
          content: item.description || '',
          source: feed.name,
          timestamp: new Date(item.pubDate),
          status: 'pending' as const,
          url: item.link,
          isNew,
          scheduledTime: new Date(scheduledTime)
        };
        
        if (isWithinLast48Hours(article.timestamp) && 
            checkArticleKeywords(article.title, article.content)) {
          articles.push(article);
          newArticleIds.push(article.id);
          
          // Process the article
          try {
            console.log(`Processing article: ${article.title}`);
            const processedArticle = await processArticle(article);
            
            // Update the article in the list
            const index = articles.findIndex(a => a.id === article.id);
            if (index !== -1) {
              articles[index] = processedArticle;
            }
            
            toast.success(`Article processed: ${article.title}`);
          } catch (error) {
            console.error(`Error processing article: ${article.title}`, error);
            toast.error(`Failed to process article: ${article.title}`);
            
            const index = articles.findIndex(a => a.id === article.id);
            if (index !== -1) {
              articles[index] = {
                ...articles[index],
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to process article'
              };
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
      toast.error(`Failed to fetch articles from ${feed.name}`);
    }
  }

  localStorage.setItem('fetchedArticleIds', JSON.stringify([...newArticleIds]));
  return articles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const refreshFeeds = async (): Promise<void> => {
  console.log('Manually refreshing feeds...');
};

export { useFeedStore } from './feedUtils';
