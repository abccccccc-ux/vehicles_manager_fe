import { useState, useEffect } from 'react';
import { BellOutlined, SettingOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotificationContext } from './NotificationProvider';
import './NotificationCenter.css';
import { Badge, Popover, Button, Switch, Space, Typography } from 'antd';
import NotificationList from './NotificationList';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    settings,
    isConnected,
    isAuthenticated,
    authError,
    markAsRead,
    markAllAsRead,
    removeNotification,
    requestPermission,
    updateSettings
  } = useNotificationContext();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Show authentication error if any
  useEffect(() => {
    if (authError) {
      console.error('🚨 Notification authentication error:', authError);
    }
  }, [authError]);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    const id = notification._id || notification.id;
    const isRead = typeof notification.isRead !== 'undefined' ? notification.isRead : notification.read;
    if (!isRead) {
      try {
        await markAsRead(id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
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
    <div className="notification-settings" style={{ width: 360 }}>
      <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>Cài đặt thông báo</Typography.Title>
        <Button type="text" icon={<DeleteOutlined />} onClick={() => setShowSettings(false)} />
      </div>

      <div className="settings-content">
        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><Typography.Text>Thông báo trên trình duyệt</Typography.Text></div>
          <div>
            <Switch checked={settings.browserNotifications} onChange={(val) => updateSettings({ ...settings, browserNotifications: val })} />
            {!settings.browserNotifications && (
              <Button size="small" style={{ marginLeft: 8 }} onClick={handleEnableBrowserNotifications}>Bật</Button>
            )}
          </div>
        </div>

        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><Typography.Text>Âm thanh thông báo</Typography.Text></div>
          <div><Switch checked={settings.soundNotifications} onChange={(val) => updateSettings({ ...settings, soundNotifications: val })} /></div>
        </div>
      </div>
    </div>
  );

  const panelContent = (
    <div style={{ width: 360 }}>
      <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Thông báo</Typography.Title>
        <Space>
          <Button type="text" icon={<SettingOutlined />} onClick={() => setShowSettings(!showSettings)} />
          {notifications.length > 0 && (
            <>
              <Button 
                type="text" 
                icon={<CheckOutlined />} 
                onClick={async () => {
                  try {
                    await markAllAsRead();
                  } catch (error) {
                    console.error('Failed to mark all as read:', error);
                  }
                }}
              />
            </>
          )}
        </Space>
      </div>

      <div style={{ padding: 8 }}>
        {showSettings ? (
          <NotificationSettings />
        ) : (
          <div className="notification-content">
            <NotificationList
              initial={notifications}
              onOpen={(item) => handleNotificationClick(item)}
              onMarkRead={async (id) => { 
                try { 
                  await markAsRead(id); 
                } catch (e) {
                  console.error('Failed to mark notification as read:', e);
                } 
              }}
              onRemove={(id) => { try { removeNotification(id); } catch (e) {} }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="notification-center">
      <Popover
        content={panelContent}
        trigger="click"
        placement="bottomRight"
        open={isOpen}
        onOpenChange={(visible) => {
          setIsOpen(visible);
        }}
      >
        <Badge count={unreadCount > 99 ? '99+' : unreadCount} offset={[6, 0]}>
          <Button type="text" aria-label="Mở trung tâm thông báo" className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`} onClick={() => { toggleNotificationCenter(); }}>
            <BellOutlined style={{ fontSize: 18 }} />
          </Button>
        </Badge>
      </Popover>

      <div className={`connection-status ${isConnected && isAuthenticated ? 'authenticated' : isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected && isAuthenticated ? '🟢' : isConnected ? '🟡' : '🔴'}
      </div>
    </div>
  );
};

export default NotificationCenter;
