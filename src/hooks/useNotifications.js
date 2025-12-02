import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

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

  // Update authentication status
  const updateAuthStatus = useCallback(({ authenticated, error }) => {
    setIsAuthenticated(authenticated);
    setAuthError(error || null);
  }, []);

  // Handle authentication failure
  const handleAuthFailure = useCallback((error) => {
    console.error('Authentication failed, may need to redirect to login');
    setAuthError(error);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Initial data
    updateNotifications();
    setSettings(notificationService.settings);
    setIsConnected(notificationService.isConnected);
    setIsAuthenticated(notificationService.isAuthenticated);

    // Event listeners
    notificationService.on('new_notification', updateNotifications);
    notificationService.on('notification_updated', updateNotifications);
    notificationService.on('notifications_updated', updateNotifications);
    notificationService.on('settings_updated', updateSettings);
    notificationService.on('connection_status', updateConnectionStatus);
    notificationService.on('authentication_status', updateAuthStatus);
    notificationService.on('authentication_failed', handleAuthFailure);

    return () => {
      notificationService.off('new_notification', updateNotifications);
      notificationService.off('notification_updated', updateNotifications);
      notificationService.off('notifications_updated', updateNotifications);
      notificationService.off('settings_updated', updateSettings);
      notificationService.off('connection_status', updateConnectionStatus);
      notificationService.off('authentication_status', updateAuthStatus);
      notificationService.off('authentication_failed', handleAuthFailure);
    };
  }, [updateNotifications, updateSettings, updateConnectionStatus, updateAuthStatus, handleAuthFailure]);

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

  // Connect notification service with authentication
  const connect = useCallback((token, userInfo) => {
    notificationService.connect(token, userInfo);
  }, []);

  // Reconnect notification service
  const reconnect = useCallback((token, userInfo) => {
    notificationService.reconnect(token, userInfo);
  }, []);

  // Disconnect notification service
  const disconnect = useCallback(() => {
    notificationService.disconnect();
  }, []);

  // Check if socket is authenticated
  const checkAuth = useCallback(() => {
    return notificationService.isSocketAuthenticated();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    isConnected,
    isAuthenticated,
    authError,
    
    // Actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
    updateSettings: updateNotificationSettings,
    connect,
    reconnect,
    disconnect,
    checkAuth
  };
};
