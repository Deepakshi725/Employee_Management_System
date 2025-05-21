
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import NotificationList from "@/components/notifications/NotificationList";

const NotificationsPage: React.FC = () => {
  const { state } = useAuth();

  useEffect(() => {
    document.title = "Notifications | Employee Management System";
  }, []);

  if (!state.user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Stay updated with important information
        </p>
      </div>

      <NotificationList role={state.user.role} />
    </div>
  );
};

export default NotificationsPage;
