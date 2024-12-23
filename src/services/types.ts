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
  status: 'pending' | 'published' | 'rejected' | 'scheduled' | 'error';
  url: string;
  scheduledTime?: Date;
  rewrittenContent?: string;
  isNew?: boolean;
  error?: string;
}