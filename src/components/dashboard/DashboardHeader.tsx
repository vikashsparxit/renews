import { Clock } from "lucide-react";
import { RefreshCw, Key, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "@/components/Settings";
import { NotificationDropdown } from "./NotificationDropdown";

interface DashboardHeaderProps {
  inputInterval: string;
  isRefreshing: boolean;
  onIntervalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
}

export const DashboardHeader = ({
  inputInterval,
  isRefreshing,
  onIntervalChange,
  onRefresh,
}: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">ReNews Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <Input
            type="number"
            min="1"
            value={inputInterval}
            onChange={onIntervalChange}
            className="w-20"
            title="Refresh interval in minutes"
          />
          <span className="text-sm text-muted-foreground">minutes</span>
        </div>
        <Button 
          onClick={onRefresh} 
          disabled={isRefreshing} 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Feeds
        </Button>
        <NotificationDropdown />
        <Settings icon={<Key className="h-4 w-4" />} />
      </div>
    </div>
  );
};