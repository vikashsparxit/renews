import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RSSFeed } from './types';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface FeedStore {
  feeds: RSSFeed[];
  addFeed: (feed: Omit<RSSFeed, 'status' | 'lastUpdate'>) => void;
  removeFeed: (url: string) => void;
  updateFeedStatus: (url: string, status: 'active' | 'error') => void;
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set) => ({
      feeds: [],
      addFeed: (feed) => set((state) => ({
        feeds: [...state.feeds, { 
          ...feed, 
          status: 'active', 
          lastUpdate: new Date() 
        }]
      })),
      removeFeed: (url) => set((state) => ({
        feeds: state.feeds.filter(f => f.url !== url)
      })),
      updateFeedStatus: (url, status) => set((state) => ({
        feeds: state.feeds.map(f => 
          f.url === url ? { ...f, status, lastUpdate: new Date() } : f
        )
      }))
    }),
    {
      name: 'feed-storage',
    }
  )
);

export const fetchFeedContent = async (feedUrl: string) => {
  console.log(`Fetching feed content for: ${feedUrl}`);
  const response = await axios.get(`${CORS_PROXY}${feedUrl}`);
  const parser = new XMLParser();
  return parser.parse(response.data);
};