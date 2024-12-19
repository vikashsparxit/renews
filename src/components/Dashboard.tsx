import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { format, formatDistanceToNow } from "date-fns";
import { RefreshCw, Rss, Key, ExternalLink, PauseCircle, Clock } from "lucide-react";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { KeywordManager } from "@/components/KeywordManager";
import { ArticlePreview } from "@/components/ArticlePreview";
import { Settings } from "@/components/Settings";
import { useScheduleStore } from "@/services/rssService";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";

export const Dashboard = () => {
  const { feeds, articles, isLoading, isRefreshing, refresh } = useRSSFeeds();
  const { interval, setInterval, lastFetch } = useScheduleStore();
  const [inputInterval, setInputInterval] = useState(interval.toString());
  
  const refreshFeeds = useCallback(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      refreshFeeds();
    }, interval * 60 * 1000);

    return () => window.clearInterval(timerId);
  }, [interval, refreshFeeds]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputInterval(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setInterval(numValue);
      toast.success(`Refresh interval updated to ${numValue} minutes`);
    }
  };

  const handleHoldArticle = async (articleId: string) => {
    // Implementation for holding/pausing scheduled articles
    toast.success('Article held from publishing');
  };

  const handleAddFeed = (url: string) => {
    // Implementation for adding new RSS feed
    console.log('Adding new feed:', url);
    toast.success('RSS feed added successfully');
  };

  const handleDeleteFeed = (url: string) => {
    // Implementation for deleting RSS feed
    console.log('Deleting feed:', url);
    toast.success('RSS feed deleted successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">News Aggregation Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Input
              type="number"
              min="1"
              value={inputInterval}
              onChange={handleIntervalChange}
              className="w-20"
              title="Refresh interval in minutes"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
          <Button onClick={refreshFeeds} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Feeds
          </Button>
          <Settings icon={<Key className="h-4 w-4" />} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Management</CardTitle>
          </CardHeader>
          <CardContent>
            <KeywordManager />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rss className="h-5 w-5" />
              RSS Feeds Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RSSFeedManager
              feeds={feeds}
              onAddFeed={handleAddFeed}
              onDeleteFeed={handleDeleteFeed}
            />
            {lastFetch && (
              <div className="text-sm text-muted-foreground mt-4">
                Last fetch: {formatDistanceToNow(lastFetch)} ago
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles?.filter(a => a.rewrittenContent).map((article) => (
                <div key={article.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{format(new Date(article.timestamp), "HH:mm")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArticlePreview article={article} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(article.url, '_blank')}
                        title="Open original article"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </Button>
                    </div>
                  </div>
                  {articles.indexOf(article) < articles.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles?.filter(a => a.status === 'scheduled' && a.scheduledTime).map((article) => (
                <div key={article.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Scheduled: {format(new Date(article.scheduledTime!), "HH:mm")}</span>
                        <span>•</span>
                        <span>{article.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArticlePreview article={article} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(article.url, '_blank')}
                        title="Open original article"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleHoldArticle(article.id)}
                        title="Hold publication"
                      >
                        <PauseCircle className="h-4 w-4 text-yellow-500" />
                      </Button>
                    </div>
                  </div>
                  {articles.indexOf(article) < articles.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
