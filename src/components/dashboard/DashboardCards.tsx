import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Rss } from "lucide-react";
import { KeywordManager } from "@/components/KeywordManager";
import { RSSFeedManager } from "@/components/RSSFeedManager";
import { RSSFeed } from "@/services/rssService";
import { formatDistanceToNow } from "date-fns";

interface DashboardCardsProps {
  feeds: RSSFeed[];
  lastFetch: Date | null;
}

export const DashboardCards = ({ feeds, lastFetch }: DashboardCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Keyword Management</CardTitle>
        </CardHeader>
        <CardContent>
          <KeywordManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Rss className="h-5 w-5" />
            RSS Feeds Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RSSFeedManager />
          {lastFetch && (
            <div className="text-sm text-muted-foreground mt-4 italic">
              Last fetch: {formatDistanceToNow(lastFetch)} ago
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};