import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Notification, UserRole } from "@/lib/types";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface NotificationListProps {
  role: UserRole;
}

const API_BASE_URL = "http://localhost:5000"; // Your backend API base URL

const NotificationList: React.FC<NotificationListProps> = ({ role }) => {
  const { toast } = useToast();
  const { state } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        setError("Authentication token not found.");
        return; // Exit if not authenticated
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
       // Backend returns notifications with createdAt as ISO string, parse to Date
      const fetchedNotifications: Notification[] = data.notifications.map((notif: any) => ({
        ...notif,
         // Ensure createdAt is a Date object for getTimeAgo
        createdAt: new Date(notif.createdAt),
      }));
      setNotifications(fetchedNotifications);

    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching notifications.');
      console.error("Fetch notifications error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // fetchNotifications has no external dependencies, so useCallback is fine

  useEffect(() => {
    if (state.isAuthenticated) { // Fetch notifications only if authenticated
      fetchNotifications();
    }
  }, [state.isAuthenticated, fetchNotifications]); // Refetch when authentication state or fetchNotifications changes

  const markAsRead = async (id: string) => {
    setIsMarkingRead(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
         toast({
           title: "Error",
           description: "Authentication token not found. Please log in.",
           variant: "destructive",
         });
         setIsMarkingRead(false);
         return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/${id}/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to mark notification as read');
       }
      
      // Update local state immediately on success
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

       toast({
         title: "Success",
         description: "Notification marked as read.",
       });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      });
      console.error("Mark as read error:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const markAllAsRead = async () => {
     setIsMarkingRead(true);
     try {
       const token = localStorage.getItem("token");
       if (!token) {
         toast({
           title: "Error",
           description: "Authentication token not found. Please log in.",
           variant: "destructive",
         });
         setIsMarkingRead(false);
         return;
       }

       const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
         method: 'PUT',
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to mark all notifications as read');
        }

       // Update local state immediately on success
       setNotifications(
         notifications.map((notification) => ({ ...notification, read: true }))
       );

        toast({
          title: "Success",
          description: "All notifications marked as read.",
        });

     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message || "Failed to mark all notifications as read. Please try again.",
         variant: "destructive",
       });
       console.error("Mark all as read error:", error);
     } finally {
       setIsMarkingRead(false);
     }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!state.isAuthenticated) {
    return <div className="p-4 text-center text-red-500">Please log in to view notifications.</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <Card className="w-full card-gradient">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-primary rounded-full">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Stay updated with the latest information
          </CardDescription>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={isMarkingRead}>
            {isMarkingRead && <Loader2 className="mr-2 h-4 w-4 animate-spin mr-2" />} Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-colors ${
                  notification.read
                    ? "bg-secondary/30"
                    : "bg-secondary/70 border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    {!notification.read && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-1 text-xs"
                        onClick={() => markAsRead(notification.id)}
                         disabled={isMarkingRead && notifications.find(n => n.id === notification.id)?.read === false}
                      >
                        {isMarkingRead && notifications.find(n => n.id === notification.id)?.read === false && <Loader2 className="mr-2 h-4 w-4 animate-spin mr-2" />}Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationList;
