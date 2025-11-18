import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    settings,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission,
    updateSettings
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Automatically mark notifications as read when opened
      setTimeout(markAllAsRead, 1000);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle actionable notifications
    if (notification.actionable) {
      handleActionableNotification(notification);
    }
  };

  const handleActionableNotification = (notification) => {
    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case 'access_request':
        // Navigate to security dashboard or access requests page
        window.location.href = '/security-dashboard';
        break;
      case 'working_hours_request':
        // Navigate to working hours requests page
        window.location.href = '/working-hours-requests';
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🔵';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vehicle_detected': return '🚗';
      case 'access_request': return '🚪';
      case 'working_hours_request': return '⏰';
      case 'camera_status': return '📹';
      case 'system_alert': return '⚠️';
      default: return '📢';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return time.toLocaleDateString('vi-VN');
  };

  const handleEnableBrowserNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({
        ...settings,
        browserNotifications: true
      });
    }
  };

  const NotificationSettings = () => (
    <div className="notification-settings">
      <div className="settings-header">
        <h4>Cài đặt thông báo</h4>
        <button 
          className="close-btn"
          onClick={() => setShowSettings(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="settings-content">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.browserNotifications}
              onChange={(e) => updateSettings({
                ...settings,
                browserNotifications: e.target.checked
              })}
            />
            Thông báo trên trình duyệt
          </label>
          {!settings.browserNotifications && (
            <button 
              className="enable-btn"
              onClick={handleEnableBrowserNotifications}
            >
              Bật thông báo
            </button>
          )}
        </div>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.soundNotifications}
              onChange={(e) => updateSettings({
                ...settings,
                soundNotifications: e.target.checked
              })}
            />
            Âm thanh thông báo
          </label>
        </div>

        <div className="setting-section">
          <h5>Loại thông báo</h5>
          {Object.entries(settings.enabledTypes || {}).map(([type, enabled]) => (
            <div key={type} className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => updateSettings({
                    ...settings,
                    enabledTypes: {
                      ...settings.enabledTypes,
                      [type]: e.target.checked
                    }
                  })}
                />
                {getTypeLabel(type)}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getTypeLabel = (type) => {
    switch (type) {
      case 'vehicle_detected': return 'Phát hiện xe';
      case 'access_request': return 'Yêu cầu truy cập';
      case 'working_hours_request': return 'Yêu cầu làm thêm giờ';
      case 'camera_status': return 'Trạng thái camera';
      case 'system_alert': return 'Cảnh báo hệ thống';
      default: return type;
    }
  };

  return (
    <div className="notification-center">
      {/* Notification Bell */}
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={toggleNotificationCenter}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢' : '🔴'}
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Thông báo</h3>
            <div className="notification-actions">
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt"
              >
                ⚙️
              </button>
              {notifications.length > 0 && (
                <>
                  <button 
                    className="mark-all-btn"
                    onClick={markAllAsRead}
                    title="Đánh dấu tất cả đã đọc"
                  >
                    ✓
                  </button>
                  <button 
                    className="clear-all-btn"
                    onClick={clearAll}
                    title="Xóa tất cả"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>

          {showSettings ? (
            <NotificationSettings />
          ) : (
            <div className="notification-content">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="empty-icon">📭</span>
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.priority}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon">
                        {getTypeIcon(notification.type)}
                        {getPriorityIcon(notification.priority)}
                      </div>
                      
                      <div className="notification-content">
                        <div className="notification-title">
                          {notification.title}
                        </div>
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-time">
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>

                      <div className="notification-actions">
                        {notification.actionable && (
                          <span className="actionable-indicator">→</span>
                        )}
                        <button 
                          className="remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
