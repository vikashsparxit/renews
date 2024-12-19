import { format } from "date-fns";
import { ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArticlePreview } from "@/components/ArticlePreview";
import { Article } from "@/services/articleService";

interface ArticleListProps {
  articles: Article[];
}

export const ArticleList = ({ articles }: ArticleListProps) => {
  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article.id}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{article.title}</h3>
                {article.isNew && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    New
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{article.source}</span>
                <span>•</span>
                <span>{format(new Date(article.timestamp), "HH:mm")}</span>
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
            </div>
          </div>
          {articles.indexOf(article) < articles.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
};