import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

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
  status: 'pending' | 'published' | 'rejected';
  url: string;
}

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

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

export const fetchFeeds = async (): Promise<RSSFeed[]> => {
  console.log('Fetching RSS feeds...');
  return RSS_FEEDS.map(feed => ({
    ...feed,
    status: 'active',
    lastUpdate: new Date()
  }));
};

export const fetchArticles = async (): Promise<Article[]> => {
  console.log('Fetching articles...');
  const parser = new XMLParser();
  const articles: Article[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching ${feed.name}`);
      const response = await axios.get(`${CORS_PROXY}${feed.url}`);
      console.log(`Successfully fetched ${feed.name}`);

      const result = parser.parse(response.data);
      const items = result.rss?.channel?.item || [];
      console.log(`Parsing ${items.length} items from ${feed.name}`);

      const feedArticles = items.map((item: any) => ({
        id: item.guid || item.link,
        title: item.title,
        content: item.description || '',
        source: feed.name,
        timestamp: new Date(item.pubDate),
        status: 'pending' as const,
        url: item.link
      }));

      articles.push(...feedArticles);
      console.log(`Successfully parsed ${feedArticles.length} articles from ${feed.name}`);
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
    }
  }

  return articles;
};

export const refreshFeeds = async (): Promise<void> => {
  console.log('Manually refreshing feeds...');
  // The actual refresh will happen through the useQuery invalidation
};