import axios from 'axios';
import { toast } from "sonner";

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export interface Article {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  status: "pending" | "published" | "rejected";
  timestamp: Date;
}

export interface RSSFeed {
  name: string;
  url: string;
  status: "active" | "error";
  lastUpdate: Date;
}

export const feeds: RSSFeed[] = [
  {
    name: "Starnieuws",
    url: "https://www.starnieuws.com/rss/starnieuws.rss",
    status: "active",
    lastUpdate: new Date(),
  },
  {
    name: "Waterkant",
    url: "https://www.waterkant.net/feed/",
    status: "active",
    lastUpdate: new Date(),
  },
];

const parseXMLToArticles = (xml: string, source: string): Article[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const items = xmlDoc.getElementsByTagName("item");
  
  console.log(`Parsing ${items.length} items from ${source}`);
  
  return Array.from(items).map((item, index) => ({
    id: `${source}-${index}-${Date.now()}`,
    title: item.getElementsByTagName("title")[0]?.textContent || "No title",
    content: item.getElementsByTagName("description")[0]?.textContent || "No content",
    source,
    url: item.getElementsByTagName("link")[0]?.textContent || "#",
    status: "pending" as const,
    timestamp: new Date(item.getElementsByTagName("pubDate")[0]?.textContent || Date.now()),
  }));
};

export const fetchFeeds = async (): Promise<RSSFeed[]> => {
  console.log("Fetching RSS feeds...");
  
  const updatedFeeds = [...feeds];
  
  for (const feed of updatedFeeds) {
    try {
      const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(feed.url)}`);
      console.log(`Successfully fetched ${feed.name}`);
      feed.status = "active";
      feed.lastUpdate = new Date();
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
      feed.status = "error";
      toast.error(`Failed to fetch ${feed.name}`);
    }
  }
  
  return updatedFeeds;
};

export const fetchArticles = async (): Promise<Article[]> => {
  console.log("Fetching articles...");
  const articles: Article[] = [];
  
  for (const feed of feeds) {
    try {
      const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(feed.url)}`);
      const feedArticles = parseXMLToArticles(response.data, feed.name);
      articles.push(...feedArticles);
      console.log(`Successfully parsed ${feedArticles.length} articles from ${feed.name}`);
    } catch (error) {
      console.error(`Error fetching articles from ${feed.name}:`, error);
      toast.error(`Failed to fetch articles from ${feed.name}`);
    }
  }
  
  // Sort articles by timestamp, newest first
  return articles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const refreshFeeds = async (): Promise<void> => {
  console.log("Manually refreshing feeds...");
  await Promise.all([
    fetchFeeds(),
    fetchArticles()
  ]);
  toast.success("Feeds refreshed successfully");
};