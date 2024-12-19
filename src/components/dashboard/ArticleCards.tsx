import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Article } from "@/services/rssService";
import { ArticleList } from "./ArticleList";
import { ScheduledArticleList } from "./ScheduledArticleList";

interface ArticleCardsProps {
  recentArticles: Article[];
  scheduledArticles: Article[];
  onHoldArticle: (articleId: string) => void;
  onPublishArticle: (articleId: string) => void;
}

export const ArticleCards = ({ 
  recentArticles, 
  scheduledArticles,
  onHoldArticle,
  onPublishArticle
}: ArticleCardsProps) => {
  return (
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
              onHoldArticle={onHoldArticle}
              onPublishArticle={onPublishArticle}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};