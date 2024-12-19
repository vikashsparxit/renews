import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getApiKey, saveApiKey } from "@/services/storageService";

interface SettingsProps {
  icon?: React.ReactNode;
}

export const Settings: React.FC<SettingsProps> = ({ icon }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [wordpressKey, setWordpressKey] = useState('');
  const [firecrawlKey, setFirecrawlKey] = useState('');
  const [wordpressSiteUrl, setWordpressSiteUrl] = useState('');
  const [crawlingMethod, setCrawlingMethod] = useState('firecrawl');

  useEffect(() => {
    // Load saved WordPress site URL
    const savedUrl = localStorage.getItem('wp_site_url');
    if (savedUrl) setWordpressSiteUrl(savedUrl);
    
    // Load saved crawling method
    const savedMethod = localStorage.getItem('crawling_method');
    if (savedMethod) setCrawlingMethod(savedMethod);
  }, []);

  const handleSave = async () => {
    try {
      // Validate WordPress site URL if provided
      if (wordpressSiteUrl) {
        try {
          const url = new URL(wordpressSiteUrl);
          localStorage.setItem('wp_site_url', url.toString());
        } catch (error) {
          toast.error('Please enter a valid WordPress site URL');
          return;
        }
      }

      // Save API keys
      if (openaiKey) await saveApiKey('openai', openaiKey);
      if (wordpressKey) await saveApiKey('wordpress', wordpressKey);
      if (firecrawlKey) await saveApiKey('firecrawl', firecrawlKey);
      
      // Save crawling method preference
      localStorage.setItem('crawling_method', crawlingMethod);

      toast.success('Settings saved successfully');
      
      // Show WordPress setup instructions
      if (wordpressSiteUrl && wordpressKey) {
        toast.success('WordPress integration configured successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          {icon}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API & Integration Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and integration settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="openai">OpenAI API Key</Label>
            <Input
              id="openai"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter OpenAI API key"
            />
          </div>
          
          <div className="space-y-2">
            <Label>WordPress Configuration</Label>
            <Input
              type="url"
              value={wordpressSiteUrl}
              onChange={(e) => setWordpressSiteUrl(e.target.value)}
              placeholder="WordPress Site URL (e.g., https://your-site.com)"
              className="mb-2"
            />
            <Input
              type="password"
              value={wordpressKey}
              onChange={(e) => setWordpressKey(e.target.value)}
              placeholder="WordPress Application Password"
            />
            {getWordPressInstructions()}
          </div>

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
                  placeholder="Enter Firecrawl API key"
                />
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};