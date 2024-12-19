import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }

    // Listen for new toast notifications
    const handleToast = (event: CustomEvent) => {
      const newNotification = {
        id: Date.now().toString(),
        message: event.detail.message,
        timestamp: new Date()
      };
      
      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50 notifications
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('toast' as any, handleToast);
    return () => window.removeEventListener('toast' as any, handleToast);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[400px] overflow-auto">
          {notifications.length === 0 ? (
            <DropdownMenuItem className="text-muted-foreground">
              No notifications yet
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id}>
                <div className="flex flex-col gap-1">
                  <span>{notification.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp)} ago
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};