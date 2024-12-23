import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export const ProcessingStatus = () => {
  const { articles, isRefreshing } = useRSSFeeds();
  
  const totalArticles = articles?.length || 0;
  const processedArticles = articles?.filter(a => a.rewrittenContent).length || 0;
  const processingProgress = totalArticles ? (processedArticles / totalArticles) * 100 : 0;

  if (!isRefreshing && processedArticles === totalArticles) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Articles Processing</span>
            <span>{processedArticles}/{totalArticles}</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
        {isRefreshing && (
          <div className="text-sm text-muted-foreground">
            Fetching new articles...
          </div>
        )}
      </CardContent>
    </Card>
  );
};