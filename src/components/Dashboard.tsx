import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { format, formatDistanceToNow } from "date-fns";
import { RefreshCw, Rss, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { KeywordManager } from "@/components/KeywordManager";
import { ArticlePreview } from "@/components/ArticlePreview";
import { processArticle } from "@/services/articleService";
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
    }, interval * 60 * 1000); // Convert minutes to milliseconds

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

  const handleArticleAction = async (articleId: string, action: 'approve' | 'reject') => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    try {
      await processArticle({
        ...article,
        status: action === 'approve' ? 'published' : 'rejected'
      });
      
      toast.success(`Article ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      refresh();
    } catch (error) {
      toast.error(`Failed to ${action} article`);
    }
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keyword Management</CardTitle>
        </CardHeader>
        <CardContent>
          <KeywordManager />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rss className="h-5 w-5" />
              RSS Feeds Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeds?.map((feed) => (
                <div key={feed.name} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{feed.name}</h3>
                    <p className="text-sm text-muted-foreground">{feed.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={feed.status === "active" ? "default" : "destructive"}>
                      {feed.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(feed.lastUpdate, "HH:mm:ss")}
                    </span>
                  </div>
                </div>
              ))}
              {lastFetch && (
                <div className="text-sm text-muted-foreground mt-4">
                  Last fetch: {formatDistanceToNow(lastFetch)} ago
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles?.map((article, index) => (
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
                      {article.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArticleAction(article.id, 'approve')}
                            title="Approve"
                          >
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArticleAction(article.id, 'reject')}
                            title="Reject"
                          >
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {article.status === "published" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {article.status === "rejected" && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                  {index < articles.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};