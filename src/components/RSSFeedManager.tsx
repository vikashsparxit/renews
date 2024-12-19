import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { RSSFeed } from '@/services/rssService';

interface RSSFeedManagerProps {
  feeds: RSSFeed[];
  onAddFeed: (url: string) => void;
  onDeleteFeed: (url: string) => void;
}

export const RSSFeedManager: React.FC<RSSFeedManagerProps> = ({
  feeds,
  onAddFeed,
  onDeleteFeed,
}) => {
  const [newFeedUrl, setNewFeedUrl] = useState('');

  const handleAddFeed = () => {
    if (!newFeedUrl) {
      toast.error('Please enter a feed URL');
      return;
    }

    try {
      new URL(newFeedUrl);
      onAddFeed(newFeedUrl);
      setNewFeedUrl('');
      toast.success('Feed added successfully');
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          value={newFeedUrl}
          onChange={(e) => setNewFeedUrl(e.target.value)}
          placeholder="Enter RSS feed URL"
          className="flex-1"
        />
        <Button 
          onClick={handleAddFeed}
          className="bg-primary hover:bg-primary/90 text-white font-medium"
        >
          Add Feed
        </Button>
      </div>
      
      <div className="space-y-4">
        {feeds?.map((feed) => (
          <div key={feed.url} className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">{feed.name}</h3>
              <p className="text-sm text-muted-foreground">{feed.url}</p>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(feed.lastUpdate)} ago
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={feed.status === "active" ? "default" : "destructive"}
                className={feed.status === "active" ? "bg-success hover:bg-success/90" : ""}
              >
                {feed.status === "active" ? "ACTIVE" : "ERROR"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteFeed(feed.url)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};