import { toast } from "sonner";

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

// Simulated RSS feeds for now
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

// Simulated articles for now
export const articles: Article[] = [
  {
    id: "1",
    title: "President Santokhi addresses parliament",
    content: "Lorem ipsum...",
    source: "Starnieuws",
    url: "https://www.starnieuws.com/article1",
    status: "pending",
    timestamp: new Date(),
  },
  {
    id: "2",
    title: "New developments in Suriname's economy",
    content: "Lorem ipsum...",
    source: "Waterkant",
    url: "https://www.waterkant.net/article2",
    status: "published",
    timestamp: new Date(Date.now() - 30 * 60000),
  },
];

export const fetchFeeds = async (): Promise<RSSFeed[]> => {
  console.log("Fetching RSS feeds...");
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return feeds;
};

export const fetchArticles = async (): Promise<Article[]> => {
  console.log("Fetching articles...");
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return articles;
};

export const refreshFeeds = async (): Promise<void> => {
  console.log("Refreshing feeds...");
  // Simulate refresh
  await new Promise((resolve) => setTimeout(resolve, 1500));
  toast.success("Feeds refreshed successfully");
};