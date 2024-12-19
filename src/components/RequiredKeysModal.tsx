import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiKey, saveApiKey } from "@/services/storageService";
import { toast } from "sonner";

export const RequiredKeysModal = ({ onComplete }: { onComplete: () => void }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [wordpressKey, setWordpressKey] = useState('');
  const [firecrawlKey, setFirecrawlKey] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [hasAllKeys, setHasAllKeys] = useState(false);

  useEffect(() => {
    const checkExistingKeys = async () => {
      const openai = await getApiKey('openai');
      const wordpress = await getApiKey('wordpress');
      const firecrawl = await getApiKey('firecrawl');
      
      if (openai && wordpress && firecrawl) {
        setHasAllKeys(true);
        onComplete();
        setIsOpen(false);
      }
    };

    checkExistingKeys();
  }, [onComplete]);

  const handleSave = async () => {
    try {
      if (!openaiKey || !wordpressKey || !firecrawlKey) {
        toast.error('All API keys are required');
        return;
      }

      await saveApiKey('openai', openaiKey);
      await saveApiKey('wordpress', wordpressKey);
      await saveApiKey('firecrawl', firecrawlKey);
      
      toast.success('API keys saved successfully');
      setHasAllKeys(true);
      onComplete();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  if (!isOpen || hasAllKeys) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showClose={false}>
        <DialogHeader>
          <DialogTitle>Required API Keys</DialogTitle>
          <DialogDescription>
            Please provide all required API keys to continue. These keys are necessary for the application to function properly.
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
            Save and Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};