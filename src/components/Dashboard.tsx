import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { RefreshCw, Rss, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";

export const Dashboard = () => {
  const { feeds, articles, isLoading, isRefreshing, refresh } = useRSSFeeds();

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
        <Button onClick={() => refresh()} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Feeds
        </Button>
      </div>

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
                    {article.status === "published" ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : article.status === "rejected" ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse-slow" />
                    )}
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