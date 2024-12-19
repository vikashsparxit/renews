import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from "sonner";
import { saveApiKey, getApiKey } from '@/services/storageService';

export const Settings = () => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [wordpressKey, setWordpressKey] = useState('');

  useEffect(() => {
    const loadKeys = async () => {
      const savedOpenAIKey = await getApiKey('openai');
      const savedWordpressKey = await getApiKey('wordpress');
      if (savedOpenAIKey) setOpenAIKey('•'.repeat(20));
      if (savedWordpressKey) setWordpressKey('•'.repeat(20));
    };
    loadKeys();
  }, []);

  const handleSave = async () => {
    try {
      if (openAIKey && openAIKey !== '•'.repeat(20)) {
        await saveApiKey('openai', openAIKey);
      }
      if (wordpressKey && wordpressKey !== '•'.repeat(20)) {
        await saveApiKey('wordpress', wordpressKey);
      }
      toast.success('API keys saved successfully');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenAI API Key</label>
            <Input
              type="password"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="Enter OpenAI API key"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">WordPress API Key</label>
            <Input
              type="password"
              value={wordpressKey}
              onChange={(e) => setWordpressKey(e.target.value)}
              placeholder="Enter WordPress API key"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Keys
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};