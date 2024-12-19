import { format } from "date-fns";
import { ExternalLink, PauseCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArticlePreview } from "@/components/ArticlePreview";
import { Article } from "@/services/articleService";
import { Settings } from "@/components/Settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { getAutoSchedule, saveAutoSchedule, getApiKey } from "@/services/storageService";

interface ScheduledArticleListProps {
  articles: Article[];
  onHoldArticle: (articleId: string) => void;
  onPublishArticle?: (articleId: string) => void;
}

export const ScheduledArticleList = ({ 
  articles, 
  onHoldArticle,
  onPublishArticle 
}: ScheduledArticleListProps) => {
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [hasWordPress, setHasWordPress] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      const auto = await getAutoSchedule();
      setAutoSchedule(auto);
      
      // Check if WordPress is configured
      const wpKey = await getApiKey('wordpress');
      const wpUrl = await getApiKey('wordpressSiteUrl');
      setHasWordPress(Boolean(wpKey && wpUrl));
    };
    
    checkSettings();
  }, []);

  const handleAutoScheduleChange = async (checked: boolean) => {
    setAutoSchedule(checked);
    await saveAutoSchedule(checked);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-schedule"
            checked={autoSchedule}
            onCheckedChange={handleAutoScheduleChange}
          />
          <Label htmlFor="auto-schedule">Auto Schedule</Label>
        </div>
        {!hasWordPress && (
          <div className="flex items-center text-yellow-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>WordPress not configured</span>
            <Settings icon={<Button variant="ghost" size="sm" className="ml-2">Configure</Button>} />
          </div>
        )}
      </div>

      {articles.map((article) => (
        <div key={article.id}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{article.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {autoSchedule ? (
                  <span>Scheduled: {format(new Date(article.scheduledTime!), "HH:mm")}</span>
                ) : (
                  <span>Ready to publish</span>
                )}
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
              {autoSchedule ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onHoldArticle(article.id)}
                  title="Hold publication"
                >
                  <PauseCircle className="h-4 w-4 text-yellow-500" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => onPublishArticle?.(article.id)}
                  disabled={!hasWordPress}
                  title={hasWordPress ? "Publish now" : "Configure WordPress to publish"}
                >
                  Publish
                </Button>
              )}
            </div>
          </div>
          {articles.indexOf(article) < articles.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
};
