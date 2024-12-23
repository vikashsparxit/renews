import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useFeedStore } from "@/services/rssService";

export const ProcessingStatus = () => {
  const { articles, isRefreshing, lastProcessedTime } = useRSSFeeds();
  const feeds = useFeedStore((state) => state.feeds);
  
  // Only show status if we have configured feeds or are refreshing
  if (!isRefreshing && !feeds.length) return null;
  
  const totalArticles = articles?.length || 0;
  const crawledArticles = articles?.filter(a => a.content).length || 0;
  const processedArticles = articles?.filter(a => a.rewrittenContent).length || 0;
  const scheduledArticles = articles?.filter(a => a.rewrittenContent && a.status === 'scheduled').length || 0;
  const errorArticles = articles?.filter(a => a.status === 'error').length || 0;
  
  const processingProgress = totalArticles ? (processedArticles / totalArticles) * 100 : 0;

  const stages = [
    {
      id: 'fetching',
      label: 'Fetching RSS Feeds',
      status: isRefreshing ? 'active' : 'complete',
    },
    {
      id: 'finding',
      label: `Found Articles (${totalArticles})`,
      status: totalArticles > 0 ? 'complete' : isRefreshing ? 'active' : 'pending',
    },
    {
      id: 'crawling',
      label: `Crawling Content (${crawledArticles}/${totalArticles})`,
      status: crawledArticles === totalArticles ? 'complete' : crawledArticles > 0 ? 'active' : 'pending',
    },
    {
      id: 'processing',
      label: `Processing with AI (${processedArticles}/${totalArticles})`,
      status: processedArticles === totalArticles ? 'complete' : processedArticles > 0 ? 'active' : 'pending',
    },
    {
      id: 'scheduling',
      label: `Scheduling Articles (${scheduledArticles}/${totalArticles})`,
      status: processedArticles === totalArticles && scheduledArticles > 0 ? 'complete' : 'pending',
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            {isRefreshing && <Loader2 className="h-4 w-4 animate-spin" />}
            Processing Status
          </CardTitle>
          {lastProcessedTime && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Last processed: {format(lastProcessedTime, 'HH:mm')}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <div className="flex items-center gap-2">
              <span>{processedArticles}/{totalArticles}</span>
              {errorArticles > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {errorArticles} failed
                </Badge>
              )}
            </div>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-2 text-sm">
              {stage.status === 'active' ? (
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              ) : stage.status === 'complete' ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-gray-300" />
              )}
              <span className={
                stage.status === 'active' 
                  ? 'text-blue-500 font-medium'
                  : stage.status === 'complete'
                  ? 'text-muted-foreground'
                  : ''
              }>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};