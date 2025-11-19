import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Update local state when notifications change
  const updateNotifications = useCallback(() => {
    setNotifications([...notificationService.getNotifications()]);
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback(({ connected }) => {
    setIsConnected(connected);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Initial data
    updateNotifications();
    setSettings(notificationService.settings);
    setIsConnected(notificationService.isConnected);

    // Event listeners
    notificationService.on('new_notification', updateNotifications);
    notificationService.on('notification_updated', updateNotifications);
    notificationService.on('notifications_updated', updateNotifications);
    notificationService.on('settings_updated', updateSettings);
    notificationService.on('connection_status', updateConnectionStatus);

    return () => {
      notificationService.off('new_notification', updateNotifications);
      notificationService.off('notification_updated', updateNotifications);
      notificationService.off('notifications_updated', updateNotifications);
      notificationService.off('settings_updated', updateSettings);
      notificationService.off('connection_status', updateConnectionStatus);
    };
  }, [updateNotifications, updateSettings, updateConnectionStatus]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    notificationService.markAsRead(notificationId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    notificationService.removeNotification(notificationId);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      notificationService.updateSettings({
        ...notificationService.settings,
        browserNotifications: true
      });
    }
    return granted;
  }, []);

  // Update notification settings
  const updateNotificationSettings = useCallback((newSettings) => {
    notificationService.updateSettings(newSettings);
  }, []);

  // Connect notification service
  const connect = useCallback((token) => {
    notificationService.connect(token);
  }, []);

  // Disconnect notification service
  const disconnect = useCallback(() => {
    notificationService.disconnect();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    isConnected,
    
    // Actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
    updateSettings: updateNotificationSettings,
    connect,
    disconnect
  };
};
