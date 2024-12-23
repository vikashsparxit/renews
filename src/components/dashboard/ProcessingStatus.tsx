import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProcessingStatus = () => {
  const { articles, isRefreshing } = useRSSFeeds();
  
  const totalArticles = articles?.length || 0;
  const processedArticles = articles?.filter(a => a.rewrittenContent || a.status === 'error').length || 0;
  const errorArticles = articles?.filter(a => a.status === 'error').length || 0;
  const processingProgress = totalArticles ? (processedArticles / totalArticles) * 100 : 0;

  if (!isRefreshing && processedArticles === totalArticles && !errorArticles) {
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
        <div className="text-sm space-y-2">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Fetching new articles...
            </div>
          )}
          {processedArticles > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              {processedArticles} articles processed
            </div>
          )}
          {errorArticles > 0 && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-3 w-3" />
              {errorArticles} articles failed to process
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};