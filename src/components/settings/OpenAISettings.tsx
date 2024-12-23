import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiKey, saveApiKey } from "@/services/storageService";

interface OpenAISettingsProps {
  onApiKeySaved?: () => void;
  hasOpenAI: boolean;
}

export const OpenAISettings = ({ onApiKeySaved, hasOpenAI }: OpenAISettingsProps) => {
  const [openaiKey, setOpenaiKey] = useState('');

  const handleSaveOpenAI = async () => {
    try {
      if (!openaiKey.trim()) {
        toast.error('Please enter a valid OpenAI API key');
        return;
      }

      console.log('Attempting to save OpenAI key...');
      await saveApiKey('openai', openaiKey);
      console.log('OpenAI key saved successfully');
      toast.success('OpenAI API key saved successfully');
      onApiKeySaved?.();
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      toast.error('Failed to save OpenAI key. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};