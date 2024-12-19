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
import { format } from 'date-fns';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import parse from 'html-react-parser';

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
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{article.title}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Source: {article.source} | 
            {article.scheduledTime && article.status === 'scheduled' && (
              <span className="text-success ml-2">
                Scheduled to post at: {format(article.scheduledTime, 'PPpp')}
              </span>
            )}
          </div>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="h-[70vh] mt-4">
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Original Content</h3>
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {parse(article.content)}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Rewritten Content</h3>
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {article.rewrittenContent ? (
                    parse(article.rewrittenContent)
                  ) : (
                    <p className="text-muted-foreground">Content is being processed...</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  );
};