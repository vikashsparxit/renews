import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { saveApiKey } from "@/services/storageService";

interface CrawlingSettingsProps {
  hasFirecrawl: boolean;
  crawlingMethod: string;
  setCrawlingMethod: (method: string) => void;
}

export const CrawlingSettings = ({ 
  hasFirecrawl, 
  crawlingMethod, 
  setCrawlingMethod 
}: CrawlingSettingsProps) => {
  const [firecrawlKey, setFirecrawlKey] = useState('');

  const handleSaveCrawling = async () => {
    try {
      localStorage.setItem('crawling_method', crawlingMethod);
      if (crawlingMethod === 'firecrawl' && firecrawlKey) {
        await saveApiKey('firecrawl', firecrawlKey);
        toast.success('Crawling settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving crawling settings:', error);
      toast.error('Failed to save crawling settings');
    }
  };

  return (
    <div className="space-y-4">
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
            {hasFirecrawl && (
              <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
                <CheckCircle className="h-4 w-4" />
                <span>Firecrawl key is saved and active</span>
              </div>
            )}
          </div>
        )}
      </div>
      <Button onClick={handleSaveCrawling} className="w-full">
        Save Crawling Settings
      </Button>
    </div>
  );
};