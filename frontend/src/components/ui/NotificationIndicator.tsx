// components/ui/NotificationIndicator.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationIndicatorProps {
  tab: string; // The tab this indicator is for, e.g., 'applied', 'discover', or a project-specific ID like 'project_{projectId}'
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({ tab }) => {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Don't try to fetch if no user
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        let notificationsQuery;
        
        // If this is a project-specific tab (for applications)
        if (tab.startsWith('project_')) {
          const projectId = tab.substring(8); // Remove 'project_' prefix
          notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            where("isRead", "==", false),
            where("projectId", "==", projectId),
            where("type", "==", "new_application")
          );
        } else {
          // Regular tab notifications
          notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            where("isRead", "==", false),
            where("tabContext", "==", tab)
          );
        }
        
        const snapshot = await getDocs(notificationsQuery);
        setCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    
    // Set up an interval to refresh notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [user, tab]);

  // If no notifications, don't render anything
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full ml-2">
      {count}
    </span>
  );
};

export default NotificationIndicator;