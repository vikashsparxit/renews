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
import { useState } from "react";
import { toast } from "sonner";
import { getApiKey, saveApiKey } from "@/services/storageService";

interface SettingsProps {
  icon?: React.ReactNode;
}

export const Settings: React.FC<SettingsProps> = ({ icon }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [wordpressKey, setWordpressKey] = useState('');
  const [firecrawlKey, setFirecrawlKey] = useState('');

  const handleSave = async () => {
    try {
      if (openaiKey) await saveApiKey('openai', openaiKey);
      if (wordpressKey) await saveApiKey('wordpress', wordpressKey);
      if (firecrawlKey) await saveApiKey('firecrawl', firecrawlKey);
      toast.success('API keys saved successfully');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          {icon}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys for various services
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
            <Label htmlFor="wordpress">WordPress API Key</Label>
            <Input
              id="wordpress"
              type="password"
              value={wordpressKey}
              onChange={(e) => setWordpressKey(e.target.value)}
              placeholder="Enter WordPress API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firecrawl">Firecrawl API Key</Label>
            <Input
              id="firecrawl"
              type="password"
              value={firecrawlKey}
              onChange={(e) => setFirecrawlKey(e.target.value)}
              placeholder="Enter Firecrawl API key"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};