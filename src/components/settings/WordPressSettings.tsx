import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiKey, saveApiKey } from "@/services/storageService";

interface WordPressSettingsProps {
  hasWordPress: boolean;
}

export const WordPressSettings = ({ hasWordPress }: WordPressSettingsProps) => {
  const [wordpressKey, setWordpressKey] = useState('');
  const [wordpressSiteUrl, setWordpressSiteUrl] = useState('');

  const handleSaveWordPress = async () => {
    try {
      if (wordpressKey && wordpressSiteUrl) {
        try {
          const url = new URL(wordpressSiteUrl);
          await saveApiKey('wordpress', wordpressKey);
          await saveApiKey('wordpressSiteUrl', url.toString());
          toast.success('WordPress configuration saved successfully');
        } catch (error) {
          toast.error('Please enter a valid WordPress site URL');
        }
      }
    } catch (error) {
      console.error('Error saving WordPress config:', error);
      toast.error('Failed to save WordPress configuration');
    }
  };

  const getWordPressInstructions = () => (
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

  return (
    <div className="space-y-4">
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
        {hasWordPress && (
          <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
            <CheckCircle className="h-4 w-4" />
            <span>WordPress configuration is saved</span>
          </div>
        )}
        {getWordPressInstructions()}
      </div>
      <Button onClick={handleSaveWordPress} className="w-full">
        Save WordPress Settings
      </Button>
    </div>
  );
};