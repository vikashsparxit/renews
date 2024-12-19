import { format } from "date-fns";
import { ExternalLink, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArticlePreview } from "@/components/ArticlePreview";
import { Article } from "@/services/articleService";

interface ScheduledArticleListProps {
  articles: Article[];
  onHoldArticle: (articleId: string) => void;
}

export const ScheduledArticleList = ({ articles, onHoldArticle }: ScheduledArticleListProps) => {
  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article.id}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{article.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Scheduled: {format(new Date(article.scheduledTime!), "HH:mm")}</span>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onHoldArticle(article.id)}
                title="Hold publication"
              >
                <PauseCircle className="h-4 w-4 text-yellow-500" />
              </Button>
            </div>
          </div>
          {articles.indexOf(article) < articles.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
};