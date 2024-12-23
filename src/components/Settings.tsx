import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiKey } from "@/services/storageService";
import { OpenAISettings } from './settings/OpenAISettings';
import { WordPressSettings } from './settings/WordPressSettings';
import { CrawlingSettings } from './settings/CrawlingSettings';

interface SettingsProps {
  icon?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApiKeysSaved?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  icon, 
  open, 
  onOpenChange,
  onApiKeysSaved 
}) => {
  const [activeKeys, setActiveKeys] = useState({
    openai: false,
    wordpress: false,
    firecrawl: false
  });
  const [crawlingMethod, setCrawlingMethod] = useState('firecrawl');

  useEffect(() => {
    const checkExistingKeys = async () => {
      try {
        const [openai, wordpress, firecrawl, siteUrl] = await Promise.all([
          getApiKey('openai'),
          getApiKey('wordpress'),
          getApiKey('firecrawl'),
          getApiKey('wordpressSiteUrl')
        ]);
        
        setActiveKeys({
          openai: Boolean(openai),
          wordpress: Boolean(wordpress && siteUrl),
          firecrawl: Boolean(firecrawl)
        });
        
        const savedMethod = localStorage.getItem('crawling_method');
        if (savedMethod) setCrawlingMethod(savedMethod);
      } catch (error) {
        console.error('Error checking existing keys:', error);
      }
    };

    checkExistingKeys();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {icon && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            {icon}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API & Integration Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and integration settings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="crawling">Crawling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai">
            <OpenAISettings 
              onApiKeySaved={onApiKeysSaved}
              hasOpenAI={activeKeys.openai}
            />
          </TabsContent>
          
          <TabsContent value="wordpress">
            <WordPressSettings 
              hasWordPress={activeKeys.wordpress} 
            />
          </TabsContent>
          
          <TabsContent value="crawling">
            <CrawlingSettings
              hasFirecrawl={activeKeys.firecrawl}
              crawlingMethod={crawlingMethod}
              setCrawlingMethod={setCrawlingMethod}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};