import { RefreshCw } from "lucide-react";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { useScheduleStore } from "@/services/rssService";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardCards } from "./dashboard/DashboardCards";
import { ArticleCards } from "./dashboard/ArticleCards";
import { ProcessingStatus } from "./dashboard/ProcessingStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";
import { getApiKey } from "@/services/storageService";
import { publishToWordPress } from "@/services/wordpressService";
import { Settings } from "./Settings";

export const Dashboard = () => {
  const { feeds, articles, isLoading, isRefreshing, refresh } = useRSSFeeds();
  const { interval, setInterval, lastFetch } = useScheduleStore();
  const [inputInterval, setInputInterval] = useState(interval.toString());
  const [hasOpenAI, setHasOpenAI] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  useEffect(() => {
    const checkOpenAIKey = async () => {
      const openaiKey = await getApiKey('openai');
      setHasOpenAI(Boolean(openaiKey));
      if (!openaiKey) {
        setShowSettingsModal(true);
      }
    };
    
    checkOpenAIKey();
  }, []);

  const refreshFeeds = useCallback(() => {
    if (!hasOpenAI) {
      toast.error('OpenAI API key is required to process articles');
      setShowSettingsModal(true);
      return;
    }
    refresh();
  }, [refresh, hasOpenAI]);

  useEffect(() => {
    if (!hasOpenAI) return;
    
    const timerId = window.setInterval(() => {
      refreshFeeds();
    }, interval * 60 * 1000);

    return () => window.clearInterval(timerId);
  }, [interval, refreshFeeds, hasOpenAI]);

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

  // Show crawled articles in Recent Articles
  const recentArticles = articles?.filter(a => a.content) || [];
  
  // Show rewritten articles in Rewritten Posts
  const rewrittenArticles = articles?.filter(a => 
    a.rewrittenContent && 
    a.status !== 'error'
  ) || [];

  return (
    <>
      <div className={`p-6 space-y-6 ${!hasOpenAI ? 'blur-sm pointer-events-none' : ''}`}>
        <DashboardHeader
          inputInterval={inputInterval}
          isRefreshing={isRefreshing}
          onIntervalChange={handleIntervalChange}
          onRefresh={refreshFeeds}
        />

        <ProcessingStatus />

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
          scheduledArticles={rewrittenArticles}
          onHoldArticle={handleHoldArticle}
          onPublishArticle={handlePublishArticle}
        />
      </div>

      <Settings
        open={showSettingsModal || !hasOpenAI}
        onOpenChange={(open) => {
          // Only allow closing if we have OpenAI key
          if (!open && !hasOpenAI) return;
          setShowSettingsModal(open);
        }}
        onApiKeysSaved={() => {
          setHasOpenAI(true);
          setShowSettingsModal(false);
        }}
      />
    </>
  );
};
