import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Loader } from "lucide-react";
import { Article } from '@/services/rssService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import parse from 'html-react-parser';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
          <DialogTitle className="text-xl">{article.title}</DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Source: {article.source}</span>
            {article.scheduledTime && article.status === 'scheduled' && (
              <>
                <span>•</span>
                <span className="text-success">
                  Scheduled: {format(article.scheduledTime, 'PPpp')}
                </span>
              </>
            )}
          </div>
        </DialogHeader>
        
        <ResizablePanelGroup direction="horizontal" className="h-[70vh] mt-4">
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Original Content</h3>
              <ScrollArea className="h-[calc(100%-2rem)]">
                {!article.content ? (
                  <Alert>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    <AlertDescription>
                      Fetching original content...
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {parse(article.content, {
                      replace: (domNode: any) => {
                        if (domNode.name === 'img') {
                          return (
                            <img
                              src={domNode.attribs.src}
                              alt={domNode.attribs.alt || ''}
                              className="max-w-full h-auto rounded-md my-4"
                              loading="lazy"
                            />
                          );
                        }
                      }
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Rewritten Content</h3>
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {!article.rewrittenContent ? (
                    <Alert>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      <AlertDescription>
                        Content is being processed...
                      </AlertDescription>
                    </Alert>
                  ) : (
                    parse(article.rewrittenContent, {
                      replace: (domNode: any) => {
                        if (domNode.name === 'img') {
                          return (
                            <img
                              src={domNode.attribs.src}
                              alt={domNode.attribs.alt || ''}
                              className="max-w-full h-auto rounded-md my-4"
                              loading="lazy"
                            />
                          );
                        }
                      }
                    })
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