import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Rss } from "lucide-react";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { KeywordManager } from "@/components/KeywordManager";
import { Settings } from "@/components/Settings";
import { RSSFeedManager } from "@/components/RSSFeedManager";
import { useScheduleStore } from "@/services/rssService";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { ArticleList } from "./dashboard/ArticleList";
import { ScheduledArticleList } from "./dashboard/ScheduledArticleList";

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
    toast.success('Article held from publishing');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentArticles = articles?.filter(a => a.rewrittenContent) || [];
  const scheduledArticles = articles?.filter(a => a.status === 'scheduled' && a.scheduledTime) || [];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        inputInterval={inputInterval}
        isRefreshing={isRefreshing}
        onIntervalChange={handleIntervalChange}
        onRefresh={refreshFeeds}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Management</CardTitle>
          </CardHeader>
          <CardContent>
            {!feeds?.length ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No keywords configured yet. Add keywords to filter articles based on your interests.</p>
              </div>
            ) : (
              <KeywordManager />
            )}
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
            {!feeds?.length ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No RSS feeds configured. Add feeds to start aggregating news articles.</p>
              </div>
            ) : (
              <RSSFeedManager
                feeds={feeds}
                onAddFeed={(url) => console.log('Adding feed:', url)}
                onDeleteFeed={(url) => console.log('Deleting feed:', url)}
              />
            )}
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
            {!recentArticles.length ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No articles have been processed yet. Articles matching your keywords will appear here after processing.</p>
              </div>
            ) : (
              <ArticleList articles={recentArticles} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {!scheduledArticles.length ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No articles are currently scheduled. Processed articles will be automatically scheduled for publication.</p>
              </div>
            ) : (
              <ScheduledArticleList 
                articles={scheduledArticles}
                onHoldArticle={handleHoldArticle}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};