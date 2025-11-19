import { io } from 'socket.io-client';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.notifications = [];
    this.maxNotifications = 100;
    this.settings = this.loadSettings();
  }

  // Kết nối socket cho notifications
  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('🔔 Notification service connected');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('🔔 Notification service disconnected');
      this.isConnected = false;
      this.emit('connection_status', { connected: false });
    });

    // Lắng nghe các sự kiện notification từ server
    this.socket.on('vehicle_detected', (data) => {
      this.handleNotification({
        type: 'vehicle_detected',
        title: 'Phát hiện xe',
        message: `Xe ${data.licensePlate} đã được phát hiện tại camera ${data.cameraId}`,
        data,
        timestamp: new Date(),
        priority: 'high'
      });
    });

    this.socket.on('access_request', (data) => {
      this.handleNotification({
        type: 'access_request',
        title: 'Yêu cầu truy cập',
        message: `Xe ${data.licensePlate} yêu cầu vào`,
        data,
        timestamp: new Date(),
        priority: 'high',
        actionable: true
      });
    });

    this.socket.on('working_hours_request', (data) => {
      this.handleNotification({
        type: 'working_hours_request',
        title: 'Yêu cầu làm thêm giờ',
        message: `${data.username} yêu cầu làm thêm giờ`,
        data,
        timestamp: new Date(),
        priority: 'medium',
        actionable: true
      });
    });

    this.socket.on('camera_status', (data) => {
      this.handleNotification({
        type: 'camera_status',
        title: 'Trạng thái camera',
        message: `Camera ${data.cameraId} ${data.status === 'online' ? 'đã kết nối' : 'mất kết nối'}`,
        data,
        timestamp: new Date(),
        priority: data.status === 'offline' ? 'medium' : 'low'
      });
    });

    this.socket.on('system_alert', (data) => {
      this.handleNotification({
        type: 'system_alert',
        title: 'Cảnh báo hệ thống',
        message: data.message,
        data,
        timestamp: new Date(),
        priority: 'high'
      });
    });
  }

  // Xử lý notification mới
  handleNotification(notification) {
    const id = Date.now() + Math.random();
    const notificationWithId = {
      ...notification,
      id,
      read: false
    };

    // Kiểm tra cài đặt để xem có hiển thị notification này không
    if (this.shouldShowNotification(notification.type)) {
      this.notifications.unshift(notificationWithId);
      
      // Giới hạn số lượng notifications
      if (this.notifications.length > this.maxNotifications) {
        this.notifications = this.notifications.slice(0, this.maxNotifications);
      }

      // Emit notification mới
      this.emit('new_notification', notificationWithId);

      // Hiển thị browser notification nếu được bật
      if (this.settings.browserNotifications && 'Notification' in window) {
        this.showBrowserNotification(notification);
      }

      // Phát âm thanh nếu được bật
      if (this.settings.soundNotifications) {
        this.playNotificationSound();
      }
    }
  }

  // Kiểm tra xem có nên hiển thị notification không
  shouldShowNotification(type) {
    return this.settings.enabledTypes[type] !== false;
  }

  // Hiển thị browser notification
  showBrowserNotification(notification) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type
      });
    }
  }

  // Phát âm thanh notification
  playNotificationSound() {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(() => {
      // Không thể phát âm thanh (có thể do chính sách browser)
    });
  }

  // Đánh dấu notification đã đọc
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notification_updated', notification);
    }
  }

  // Đánh dấu tất cả đã đọc
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.emit('notifications_updated', this.notifications);
  }

  // Xóa notification
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.emit('notifications_updated', this.notifications);
  }

  // Xóa tất cả notifications
  clearAll() {
    this.notifications = [];
    this.emit('notifications_updated', this.notifications);
  }

  // Lấy danh sách notifications
  getNotifications() {
    return this.notifications;
  }

  // Lấy số lượng notifications chưa đọc
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Yêu cầu quyền browser notification
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Cập nhật cài đặt
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.emit('settings_updated', this.settings);
  }

  // Tải cài đặt từ localStorage
  loadSettings() {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notification settings:', e);
      }
    }

    return {
      browserNotifications: false,
      soundNotifications: true,
      enabledTypes: {
        vehicle_detected: true,
        access_request: true,
        working_hours_request: true,
        camera_status: true,
        system_alert: true
      }
    };
  }

  // Lưu cài đặt vào localStorage
  saveSettings() {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export default new NotificationService();
