import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getApiKey, saveApiKey } from "@/services/storageService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [openaiKey, setOpenaiKey] = useState('');
  const [wordpressKey, setWordpressKey] = useState('');
  const [firecrawlKey, setFirecrawlKey] = useState('');
  const [wordpressSiteUrl, setWordpressSiteUrl] = useState('');
  const [crawlingMethod, setCrawlingMethod] = useState('firecrawl');
  const [hasOpenAI, setHasOpenAI] = useState(false);
  const [hasWordPress, setHasWordPress] = useState(false);
  const [hasFirecrawl, setHasFirecrawl] = useState(false);

  useEffect(() => {
    const checkExistingKeys = async () => {
      const openai = await getApiKey('openai');
      const wordpress = await getApiKey('wordpress');
      const firecrawl = await getApiKey('firecrawl');
      const siteUrl = await getApiKey('wordpressSiteUrl');
      
      setHasOpenAI(Boolean(openai));
      setHasWordPress(Boolean(wordpress && siteUrl));
      setHasFirecrawl(Boolean(firecrawl));
      
      if (siteUrl) setWordpressSiteUrl(siteUrl);
      
      const savedMethod = localStorage.getItem('crawling_method');
      if (savedMethod) setCrawlingMethod(savedMethod);
    };

    checkExistingKeys();
  }, []);

  const handleSaveOpenAI = async () => {
    try {
      if (openaiKey) {
        await saveApiKey('openai', openaiKey);
        toast.success('OpenAI API key saved successfully');
        setHasOpenAI(true);
        onApiKeysSaved?.();
      }
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      toast.error('Failed to save OpenAI key');
    }
  };

  const handleSaveWordPress = async () => {
    try {
      if (wordpressKey && wordpressSiteUrl) {
        try {
          const url = new URL(wordpressSiteUrl);
          await saveApiKey('wordpress', wordpressKey);
          await saveApiKey('wordpressSiteUrl', url.toString());
          toast.success('WordPress configuration saved successfully');
          setHasWordPress(true);
        } catch (error) {
          toast.error('Please enter a valid WordPress site URL');
        }
      }
    } catch (error) {
      console.error('Error saving WordPress config:', error);
      toast.error('Failed to save WordPress configuration');
    }
  };

  const handleSaveCrawling = async () => {
    try {
      localStorage.setItem('crawling_method', crawlingMethod);
      if (crawlingMethod === 'firecrawl' && firecrawlKey) {
        await saveApiKey('firecrawl', firecrawlKey);
        toast.success('Crawling settings saved successfully');
        setHasFirecrawl(true);
      }
    } catch (error) {
      console.error('Error saving crawling settings:', error);
      toast.error('Failed to save crawling settings');
    }
  };

  const getWordPressInstructions = () => {
    return (
      <div className="text-sm text-muted-foreground mt-2">
        <p>To get your WordPress application password:</p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Go to your WordPress admin panel</li>
          <li>Navigate to Users → Profile</li>
          <li>Scroll to Application Passwords section</li>
          <li>Add a new application password for this integration</li>
        </ol>
      </div>
    );
  };

  const renderKeyStatus = (keyType: string, hasKey: boolean) => {
    if (hasKey) {
      return (
        <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
          <CheckCircle className="h-4 w-4" />
          <span>{keyType} key is saved and active</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {icon && (
          <Button variant="ghost" size="icon">
            {icon}
          </Button>
        )}
      </DialogTrigger>
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
          
          <TabsContent value="openai" className="space-y-4">
            {!hasOpenAI && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  OpenAI API key is required for article rewriting. The dashboard will be blocked until you provide a valid API key.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input
                id="openai"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={hasOpenAI ? "API key is saved" : "Enter OpenAI API key"}
                className={hasOpenAI ? "bg-gray-50" : ""}
              />
              {hasOpenAI && (
                <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>OpenAI key is saved and active</span>
                </div>
              )}
            </div>
            <Button onClick={handleSaveOpenAI} className="w-full">
              Save OpenAI Settings
            </Button>
          </TabsContent>
          
          <TabsContent value="wordpress" className="space-y-4">
            {!hasWordPress && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  WordPress configuration is optional. Add it when you're ready to publish articles.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>WordPress Configuration</Label>
              <Input
                type="url"
                value={wordpressSiteUrl}
                onChange={(e) => setWordpressSiteUrl(e.target.value)}
                placeholder={hasWordPress ? "WordPress site URL is saved" : "WordPress Site URL (e.g., https://your-site.com)"}
                className={hasWordPress ? "bg-gray-50" : ""}
              />
              <Input
                type="password"
                value={wordpressKey}
                onChange={(e) => setWordpressKey(e.target.value)}
                placeholder={hasWordPress ? "Application password is saved" : "WordPress Application Password"}
                className={hasWordPress ? "bg-gray-50" : ""}
              />
              {renderKeyStatus("WordPress", hasWordPress)}
              {getWordPressInstructions()}
            </div>
            <Button onClick={handleSaveWordPress} className="w-full">
              Save WordPress Settings
            </Button>
          </TabsContent>
          
          <TabsContent value="crawling" className="space-y-4">
            <div className="space-y-2">
              <Label>Content Crawling Method</Label>
              <RadioGroup value={crawlingMethod} onValueChange={setCrawlingMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="firecrawl" id="firecrawl" />
                  <Label htmlFor="firecrawl">Firecrawl API (Recommended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cors" id="cors" />
                  <Label htmlFor="cors">CORS Proxy (Fallback)</Label>
                </div>
              </RadioGroup>
              {crawlingMethod === 'firecrawl' && (
                <div className="mt-2">
                  <Input
                    type="password"
                    value={firecrawlKey}
                    onChange={(e) => setFirecrawlKey(e.target.value)}
                    placeholder={hasFirecrawl ? "Firecrawl API key is saved" : "Enter Firecrawl API key"}
                    className={hasFirecrawl ? "bg-gray-50" : ""}
                  />
                  {renderKeyStatus("Firecrawl", hasFirecrawl)}
                </div>
              )}
            </div>
            <Button onClick={handleSaveCrawling} className="w-full">
              Save Crawling Settings
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};