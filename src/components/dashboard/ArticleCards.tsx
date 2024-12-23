import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Article } from "@/services/articleService";
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
  // Filter for completed articles only
  const completedArticles = recentArticles.filter(article => 
    article.rewrittenContent && article.status !== 'error'
  );

  // Filter for ready to publish articles
  const readyToPublishArticles = scheduledArticles.filter(article => 
    article.rewrittenContent && article.status !== 'error'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {!completedArticles.length ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No articles have been processed yet. Articles matching your keywords will appear here after processing.</p>
            </div>
          ) : (
            <ArticleList articles={completedArticles} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {!readyToPublishArticles.length ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No articles are currently ready for publishing. Articles will appear here once processing is complete.</p>
            </div>
          ) : (
            <ScheduledArticleList 
              articles={readyToPublishArticles}
              onHoldArticle={onHoldArticle}
              onPublishArticle={onPublishArticle}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};