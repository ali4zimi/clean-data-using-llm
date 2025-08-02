import { useNotifications } from '@/contexts/NotificationContext';

export const useNotify = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string) => addNotification(title, message, 'success'),
    error: (title: string, message: string) => addNotification(title, message, 'error'),
    warning: (title: string, message: string) => addNotification(title, message, 'warning'),
    info: (title: string, message: string) => addNotification(title, message, 'info'),
  };
};
