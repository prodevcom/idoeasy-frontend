'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import type { ReactNode } from 'react';

export type NotificationKind =
  | 'error'
  | 'info'
  | 'info-square'
  | 'success'
  | 'warning'
  | 'warning-alt';

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle?: string;
  caption?: string;
  timeout?: number; // Auto-dismiss after N milliseconds (0 = no auto-dismiss)
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

export interface NotificationInput {
  kind: NotificationKind;
  title: string;
  subtitle?: string;
  caption?: string;
  timeout?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: NotificationInput) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notificationInput: NotificationInput): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id,
      ...notificationInput,
      timeout: notificationInput.timeout ?? (notificationInput.kind === 'success' ? 5000 : 0), // Auto-dismiss success after 5s
    };

    setNotifications((prev) => {
      const newNotifications = [...prev, notification];
      return newNotifications;
    });

    // Auto-dismiss if timeout is set
    if (notification.timeout && notification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout);
    }

    return id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationsContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/**
 * Hook to access notifications context
 */
export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext);

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
}

/**
 * Convenience hooks for specific notification types
 */
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback(
    (title: string, subtitle?: string) => {
      return addNotification({
        kind: 'success',
        title,
        subtitle,
        timeout: 5000,
      });
    },
    [addNotification],
  );

  const showError = useCallback(
    (title: string, subtitle?: string) => {
      return addNotification({
        kind: 'error',
        title,
        subtitle,
        timeout: 0, // Don't auto-dismiss errors
      });
    },
    [addNotification],
  );

  const showWarning = useCallback(
    (title: string, subtitle?: string) => {
      return addNotification({
        kind: 'warning',
        title,
        subtitle,
        timeout: 8000,
      });
    },
    [addNotification],
  );

  const showInfo = useCallback(
    (title: string, subtitle?: string) => {
      return addNotification({
        kind: 'info',
        title,
        subtitle,
        timeout: 6000,
      });
    },
    [addNotification],
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
