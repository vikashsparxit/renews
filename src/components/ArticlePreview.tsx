import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Article } from '@/services/rssService';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArticlePreviewProps {
  article: Article;
}

export const ArticlePreview = ({ article }: ArticlePreviewProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Preview">
          <Eye className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{article.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Source: {article.source}
            </div>
            <div className="prose prose-sm dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};