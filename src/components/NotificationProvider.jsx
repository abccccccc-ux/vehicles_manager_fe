import React, { useEffect, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNotifications } from '../hooks/useNotifications';
import HighPriorityNotificationPopup from './HighPriorityNotificationPopup';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, tokens, isAuthenticated } = useSelector((state) => state.auth);
  const notifications = useNotifications();

  // Auto connect khi user đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken && user) {
      console.log('🔔 Auto-connecting notification service for user:', user.username);
      
      const userInfo = {
        id: user.id,
        userId: user.id,
        username: user.username,
        role: user.role,
        departmentId: user.departmentId,
        department: user.department
      };

      notifications.connect(tokens.accessToken, userInfo);
    } else if (!isAuthenticated && notifications.isConnected) {
      console.log('🔌 Disconnecting notification service - user logged out');
      notifications.disconnect();
    }
  }, [isAuthenticated, tokens?.accessToken, user, notifications]);

  // Xử lý authentication error
  useEffect(() => {
    if (notifications.authError) {
      console.error('🚨 Notification authentication failed:', notifications.authError);
      
      // Có thể thực hiện các action khi authentication fail:
      // - Hiển thị thông báo lỗi
      // - Redirect về login page
      // - Refresh token
      
      if (notifications.authError.error === 'TOKEN_EXPIRED' || 
          notifications.authError.error === 'INVALID_TOKEN') {
        console.log('🔄 Token expired, may need to refresh or logout');
        // Dispatch logout action hoặc refresh token
      }
    }
  }, [notifications.authError]);

  // Log connection status
  useEffect(() => {
    if (notifications.isConnected && notifications.isAuthenticated) {
      console.log('✅ Notification service fully connected and authenticated');
    } else if (notifications.isConnected && !notifications.isAuthenticated) {
      console.log('⚠️ Notification service connected but not authenticated');
    } else {
      console.log('❌ Notification service disconnected');
    }
  }, [notifications.isConnected, notifications.isAuthenticated]);

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
      <HighPriorityNotificationPopup />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
