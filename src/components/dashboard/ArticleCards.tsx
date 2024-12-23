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
  // Show all articles that have been crawled but not yet rewritten
  const crawledArticles = recentArticles.filter(article => 
    article.content && article.status !== 'error'
  );

  // Show all articles that have been successfully rewritten
  const rewrittenArticles = scheduledArticles.filter(article => 
    article.rewrittenContent && article.status !== 'error'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {!crawledArticles.length ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No articles have been crawled yet. Articles matching your keywords will appear here after crawling.</p>
            </div>
          ) : (
            <ArticleList articles={crawledArticles} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rewritten Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {!rewrittenArticles.length ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No articles have been rewritten yet. Articles will appear here once OpenAI processing is complete.</p>
            </div>
          ) : (
            <ScheduledArticleList 
              articles={rewrittenArticles}
              onHoldArticle={onHoldArticle}
              onPublishArticle={onPublishArticle}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};