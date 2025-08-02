'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: NotificationItem['type'] = 'info'
  ) => {
    const notification: NotificationItem = {
      id: generateId(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    // Add to notifications state
    setNotifications(prev => [notification, ...prev]);

    // Show toast notification
    const toastMessage = `${title}: ${message}`;
    switch (type) {
      case 'success':
        toast.success(toastMessage);
        break;
      case 'error':
        toast.error(toastMessage);
        break;
      case 'warning':
        toast(toastMessage, {
          icon: '⚠️',
          style: {
            background: '#f59e0b',
            color: '#fff',
          },
        });
        break;
      case 'info':
      default:
        toast(toastMessage, {
          icon: 'ℹ️',
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        });
        break;
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Transform notifications to include formatted time
  const notificationsWithFormattedTime = notifications.map(notification => ({
    ...notification,
    timeAgo: getTimeAgo(notification.timestamp),
  }));

  const value: NotificationContextType = {
    notifications: notificationsWithFormattedTime,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
