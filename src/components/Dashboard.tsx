import { RefreshCw } from "lucide-react";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { useScheduleStore } from "@/services/rssService";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardCards } from "./dashboard/DashboardCards";
import { ArticleCards } from "./dashboard/ArticleCards";
import { getApiKey } from "@/services/storageService";
import { publishToWordPress } from "@/services/wordpressService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";

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

  const handlePublishArticle = async (articleId: string) => {
    try {
      const wpKey = await getApiKey('wordpress');
      const wpUrl = await getApiKey('wordpressSiteUrl');
      
      if (!wpKey || !wpUrl) {
        toast.error('WordPress configuration is required for publishing');
        return;
      }
      
      const article = articles?.find(a => a.id === articleId);
      if (!article) return;
      
      if (!article.rewrittenContent) {
        toast.error('Cannot publish while content is still processing');
        return;
      }
      
      await publishToWordPress({
        title: article.title,
        content: article.rewrittenContent,
        status: 'publish'
      });
      
      toast.success('Article published successfully');
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Failed to publish article');
    }
  };

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

      {isRefreshing && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20">
          <Loader className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <AlertDescription>
            Fetching and processing new articles...
          </AlertDescription>
        </Alert>
      )}

      <DashboardCards 
        feeds={feeds || []} 
        lastFetch={lastFetch}
      />

      <ArticleCards
        recentArticles={recentArticles}
        scheduledArticles={scheduledArticles}
        onHoldArticle={handleHoldArticle}
        onPublishArticle={handlePublishArticle}
      />
    </div>
  );
};