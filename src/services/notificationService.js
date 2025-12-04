import { io } from 'socket.io-client';
import accessLogService from './accessLogService';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.isAuthenticated = false;
    this.notifications = [];
    this.maxNotifications = 100;
    this.settings = this.loadSettings();
    this.userInfo = null;
  }

  // Kết nối socket cho notifications
  connect(token, userInfo = null) {
    if (this.socket?.connected) {
      console.log('🔔 Socket already connected, skipping...');
      return;
    }

    const socketUrl = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:8000';
    console.log('🔔 Connecting to notification server:', socketUrl);

    // Lưu thông tin user để sử dụng trong authentication
    this.userInfo = userInfo;

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Notification service connected successfully', 'Socket ID:', this.socket.id);
      this.isConnected = true;
      
      // Gửi thông tin authentication ngay sau khi kết nối thành công
      this.authenticateSocket(token);
      
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Notification service disconnected:', reason);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.emit('connection_status', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Notification connection error:', error);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.emit('connection_status', { connected: false });
    });

    // Lắng nghe kết quả authentication
    this.socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('🔐 Authentication successful!');
        console.log('✅ Joined rooms:', data.rooms);
        this.isAuthenticated = true;
        
        // Emit authentication success event
        this.emit('authentication_status', { 
          authenticated: true, 
          rooms: data.rooms,
          userInfo: data.userInfo 
        });
        
        // Sau khi authenticate thành công, subscribe notifications
        this.subscribeToNotifications();
      } else {
        console.error('❌ Authentication failed:', data.error);
        this.isAuthenticated = false;
        this.emit('authentication_status', { 
          authenticated: false, 
          error: data.error 
        });
      }
    });

    // Xử lý lỗi authentication
    this.socket.on('authentication_error', (error) => {
      console.error('❌ Authentication failed:', error.error);
      this.isAuthenticated = false;
      this.emit('authentication_status', { 
        authenticated: false, 
        error: error.error 
      });
      
      // Có thể emit event để redirect về login page
      this.emit('authentication_failed', error);
    });

  }

  // Gửi thông tin authentication tới server
  authenticateSocket(token) {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Cannot authenticate: socket not connected');
      return;
    }

    const authData = {
      userId: this.userInfo?.id || this.userInfo?.userId || 'unknown',
      role: this.userInfo?.role || 'user',
      departmentId: this.userInfo?.departmentId || this.userInfo?.department?.id,
      token: token
    };

    console.log('🔐 Sending authentication data:', { ...authData, token: '***' });
    this.socket.emit('authenticate', authData);
  }

  // Subscribe tới notifications sau khi authentication thành công
  subscribeToNotifications() {
    if (!this.socket || !this.isAuthenticated) {
      console.error('❌ Cannot subscribe: socket not authenticated');
      return;
    }

    console.log('🔔 Subscribing to notification events...');
    console.log('🔔 Socket ID:', this.socket.id);
    console.log('🔔 User Info:', this.userInfo);

    // Debug: Listen to all events
    this.socket.onAny((eventName, ...args) => {
      console.log('🔔 Socket received event:', eventName, args);
    });

    // Lắng nghe event notification chung từ server
    this.socket.on('notification', (data) => {
      console.log('🔔 Received notification:', data);
      
      // Xử lý theo type của notification
      switch (data.type) {
        case 'working_hours_request':
          this.handleNotification({
            type: 'working_hours_request',
            title: 'Yêu cầu giờ làm việc',
            message: `${data.data?.username || data.data?.requesterName} yêu cầu ra/vào - Biển số: ${data.data?.licensePlate}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'high',
            actionable: true
          });
          break;

        case 'working_hours_request_update':
          this.handleNotification({
            type: 'working_hours_request_update',
            title: 'Cập nhật yêu cầu giờ làm việc',
            message: `Yêu cầu của bạn đã được ${data.data?.status === 'approved' ? 'phê duyệt' : 'từ chối'} bởi ${data.data?.approverName}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'medium'
          });
          break;

        case 'access_log_verification':
          this.handleNotification({
            type: 'access_log_verification',
            title: data.title || 'Xác minh log ra/vào',
            message: data.message || `Xe ${data.data?.licensePlate} tại cổng ${data.data?.gateName} cần xác minh - Độ tin cậy: ${Math.round((data.data?.confidence || 0) * 100)}%`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'high',
            actionable: true
          });
          break;

        case 'access_log_verified':
          this.handleNotification({
            type: 'access_log_verified',
            title: data.title || 'Log đã được xác minh',
            message: data.message || `Log ra/vào của xe ${data.data?.licensePlate} đã được ${data.data?.verifierName} xác minh: ${data.data?.verificationResult}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'medium'
          });
          break;

        case 'vehicle_access':
          this.handleNotification({
            type: 'vehicle_access',
            title: 'Xe ra/vào',
            message: `Xe ${data.data?.licensePlate || 'không xác định'} đã ${data.data?.direction === 'in' ? 'vào' : 'ra'} cổng ${data.data?.gateName || data.data?.gateId}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'medium',
            actionable: true
          });
          
          // Emit specific event for vehicle access để có thể hook vào từ components
          this.emit('vehicle_access', {
            notification: data,
            data: data.data
          });

          // Fetch latest access logs khi có xe access mới
          try {
            console.log('🚗 Vehicle access detected, fetching latest access logs...');
            accessLogService.fetchLatestAccessLogs();
          } catch (error) {
            console.error('❌ Error fetching access logs after vehicle access:', error);
          }
          break;

        default:
          console.log('🔔 Unknown notification type:', data.type);
          // Vẫn hiển thị notification chung cho các type không biết
          this.handleNotification({
            type: data.type,
            title: data.title || 'Thông báo',
            message: data.message || 'Bạn có thông báo mới',
            data: data.data || data,
            timestamp: new Date(data.timestamp || Date.now()),
            priority: data.priority || 'medium'
          });
      }
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
        working_hours_request: true,
        working_hours_request_update: true,
        access_log_verification: true,
        access_log_verified: true,
        vehicle_access: true
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

  // Kiểm tra trạng thái kết nối
  isSocketConnected() {
    return this.socket?.connected && this.isConnected;
  }

  // Kiểm tra trạng thái authentication
  isSocketAuthenticated() {
    return this.isSocketConnected() && this.isAuthenticated;
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    return this.userInfo;
  }

  // Debug method để kiểm tra trạng thái
  getDebugInfo() {
    return {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      userInfo: this.userInfo,
      listeners: Array.from(this.listeners.keys()),
      notificationCount: this.notifications.length
    };
  }

  // Reconnect với authentication
  reconnect(token, userInfo = null) {
    console.log('🔄 Reconnecting notification service...');
    this.disconnect();
    setTimeout(() => {
      this.connect(token, userInfo);
    }, 1000);
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting notification service...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isAuthenticated = false;
      this.userInfo = null;
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
