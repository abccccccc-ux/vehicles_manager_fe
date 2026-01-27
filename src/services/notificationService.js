import { io } from 'socket.io-client';
import accessLogService from './accessLogService';

// Notification types matching backend spec
export const NOTIFICATION_TYPES = {
  WORKING_HOURS_REQUEST: 'working_hours_request',
  WORKING_HOURS_REQUEST_UPDATE: 'working_hours_request_update',
  VEHICLE_VERIFICATION: 'vehicle_verification',
  VEHICLE_VERIFIED: 'vehicle_verified',
  VEHICLE_ACCESS: 'vehicle_access'
};

// All subscribable notification types
export const ALL_NOTIFICATION_TYPES = [
  NOTIFICATION_TYPES.WORKING_HOURS_REQUEST,
  NOTIFICATION_TYPES.WORKING_HOURS_REQUEST_UPDATE,
  NOTIFICATION_TYPES.VEHICLE_VERIFICATION,
  NOTIFICATION_TYPES.VEHICLE_VERIFIED,
  NOTIFICATION_TYPES.VEHICLE_ACCESS
];

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
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.subscribedVehicles = [];
    this.subscribedGates = [];
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
    console.log("🚀 ~ NotificationService ~ authenticateSocket ~ this.userInfo:", this.userInfo)

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
  subscribeToNotifications(types = ALL_NOTIFICATION_TYPES) {
    if (!this.socket || !this.isAuthenticated) {
      console.error('❌ Cannot subscribe: socket not authenticated');
      return;
    }

    console.log('🔔 Subscribing to notification events...');
    console.log('🔔 Socket ID:', this.socket.id);
    console.log('🔔 User Info:', this.userInfo);
    console.log('🔔 Subscription types:', types);

    // Emit subscribe_notifications event to server with types array
    this.socket.emit('subscribe_notifications', {
      types: types
    });

    // Listen for subscription confirmation
    this.socket.on('notifications_subscribed', (data) => {
      console.log('✅ Successfully subscribed to notifications:', data);
      this.emit('subscription_success', data);
    });

    // Listen for subscription errors
    this.socket.on('subscription_error', (error) => {
      console.error('❌ Subscription error:', error);
      this.emit('subscription_error', error);
    });

    // Debug: Listen to all events (only in development)
    if (process.env.NODE_ENV === 'development') {
      this.socket.onAny((eventName, ...args) => {
        console.log('🔔 Socket received event:', eventName, args);
      });
    }

    // Lắng nghe event notification chung từ server
    this.socket.on('notification', (data) => {
      console.log('🔔 Received notification:', data);
      
      // Xử lý theo type của notification
      switch (data.type) {
        case 'working_hours_request':
          this.handleNotification({
            _id: data._id || data.notificationId,
            notificationId: data.notificationId || data._id,
            type: 'working_hours_request',
            title: 'Yêu cầu giờ làm việc',
            message: `${data.data?.username || data.data?.requesterName} yêu cầu ra/vào - Biển số: ${data.data?.licensePlate}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'medium',
            actionable: true
          });
          break;

        case 'working_hours_request_update':
          this.handleNotification({
            _id: data._id || data.notificationId,
            notificationId: data.notificationId || data._id,
            type: 'working_hours_request_update',
            title: data.title || 'Cập nhật yêu cầu giờ làm việc',
            message: data.message || `Yêu cầu của bạn đã được ${data.data?.status === 'approved' ? 'phê duyệt' : 'từ chối'} bởi ${data.data?.approverName}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'medium'
          });
          break;

        case 'vehicle_verification':
          this.handleNotification({
            _id: data._id || data.notificationId,
            notificationId: data.notificationId || data._id,
            type: 'vehicle_verification',
            title: data.title || 'Xác minh xe',
            message: data.message || `Xe ${data.data?.licensePlate} ${data.data?.action === 'entry' ? 'vào' : 'ra'} tại ${data.data?.gateName} cần xác minh`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'high',
            actionable: true
          });
          break;

        case 'vehicle_verified':
          this.handleNotification({
            _id: data._id || data.notificationId,
            notificationId: data.notificationId || data._id,
            type: 'vehicle_verified',
            title: data.title || 'Xe đã xác minh',
            message: data.message || `Xe ${data.data?.licensePlate} đã được ${data.data?.verificationStatus === 'approved' ? 'phê duyệt' : 'từ chối'}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'medium'
          });
          break;

        case 'vehicle_access':
          this.handleNotification({
            _id: data._id || data.notificationId,
            notificationId: data.notificationId || data._id,
            type: 'vehicle_access',
            title: data.title || 'Xe ra/vào',
            message: data.message || `Xe ${data.data?.licensePlate || 'không xác định'} đã ${data.data?.direction === 'in' || data.data?.action === 'entry' ? 'vào' : 'ra'} cổng ${data.data?.gateName || data.data?.gateId}`,
            data: data.data,
            timestamp: new Date(data.timestamp),
            priority: data.priority || 'low',
            actionable: false
          });
          
          // Emit specific event for vehicle access để có thể hook vào từ components
          this.emit('vehicle_access', {
            notification: data,
            data: data.data
          });

          // Fetch latest access logs logic removed to avoid loop
          // Components should handle data refreshing via event listening
          /*
          try {
            console.log('🚗 Vehicle access detected, fetching latest access logs...');
            accessLogService.fetchLatestAccessLogs();
          } catch (error) {
            console.error('❌ Error fetching access logs after vehicle access:', error);
          }
          */
          break;

        default:
          console.log('🔔 Unknown notification type:', data.type);
          // Vẫn hiển thị notification chung cho các type không biết
          this.handleNotification({
            _id: data._id || data.notificationId,
            notificationId: data.notificationId || data._id,
            type: data.type,
            title: data.title || 'Thông báo',
            message: data.message || 'Bạn có thông báo mới',
            data: data.data || data,
            timestamp: new Date(data.timestamp || Date.now()),
            priority: data.priority || 'medium'
          });
      }
    });

    // Lắng nghe event verification_completed để xoá notification trùng lặp
    this.socket.on('verification_completed', (data) => {
      console.log('🔔 Verification completed event received:', data);
      
      const accessLogId = data.accessLogId || data.data?.accessLogId || data._id;
      
      if (accessLogId) {
        // Tìm và xoá tất cả notification có cùng accessLogId
        const beforeCount = this.notifications.length;
        this.notifications = this.notifications.filter(n => {
          const notifAccessLogId = n.data?.accessLogId;
          // Xoá notification nếu có cùng accessLogId VÀ là loại vehicle_verification
          if (notifAccessLogId === accessLogId && n.type === 'vehicle_verification') {
            console.log('🗑️ Removing duplicate notification for accessLogId:', accessLogId);
            return false;
          }
          return true;
        });
        
        const removedCount = beforeCount - this.notifications.length;
        if (removedCount > 0) {
          console.log(`✅ Removed ${removedCount} duplicate notification(s) for accessLogId: ${accessLogId}`);
          this.emit('notifications_updated', this.notifications);
        }
      }
    });
  }

  // Xử lý notification mới
  handleNotification(notification) {
    // Ưu tiên sử dụng _id từ MongoDB nếu có, fallback sang local ID
    const id = notification._id || notification.notificationId || (Date.now() + Math.random());
    const notificationWithId = {
      ...notification,
      id,
      _id: notification._id || notification.notificationId, // Giữ lại MongoDB ID
      read: false
    };

    // Kiểm tra notification trùng lặp bằng _id hoặc accessLogId
    const isDuplicate = this.notifications.some(n => {
      // Trùng _id từ MongoDB
      if (notificationWithId._id && n._id === notificationWithId._id) {
        console.log('🔄 Skipping duplicate notification by _id:', notificationWithId._id);
        return true;
      }
      // Trùng accessLogId cho vehicle_verification
      if (notification.type === 'vehicle_verification' && 
          notificationWithId.data?.accessLogId && 
          n.data?.accessLogId === notificationWithId.data?.accessLogId) {
        console.log('🔄 Skipping duplicate notification by accessLogId:', notificationWithId.data?.accessLogId);
        return true;
      }
      return false;
    });

    if (isDuplicate) {
      return; // Không thêm notification trùng lặp
    }

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
        this.playNotificationSound(notification.priority);
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
  playNotificationSound(priority = 'medium') {
    let soundFile = '/notification-sound.mp3';
    
    // Sử dụng âm thanh khác cho priority high
    if (priority === 'high') {
      soundFile = '/high-priority-notification.mp3';
    }
    
    const audio = new Audio(soundFile);
    audio.volume = priority === 'high' ? 0.8 : 0.5; // Âm lượng cao hơn cho high priority
    audio.play().catch(() => {
      // Không thể phát âm thanh (có thể do chính sách browser)
      console.log('Could not play notification sound');
    });
  }

  // Đánh dấu notification đã đọc
  async markAsRead(notificationId) {
    // Cập nhật local state NGAY LẬP TỨC để UI phản hồi nhanh
    const notification = this.notifications.find(
      n => n.id === notificationId || n._id === notificationId
    );
    if (notification && !notification.read) {
      notification.read = true;
      this.emit('notification_updated', notification);
      console.log('✅ Marked notification as read locally:', notificationId);
    }

    try {
      // Gọi API để đánh dấu trên server
      const { markNotificationRead } = await import('../api/notificationApi');
      await markNotificationRead(notificationId);
      
      console.log('✅ Synced notification read status to server:', notificationId);
    } catch (error) {
      console.error('❌ Failed to sync notification read status to server:', error);
      // Local state đã được cập nhật rồi, không cần làm gì thêm
    }
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead() {
    try {
      // Gọi API để đánh dấu trên server
      const { markAllAsReadApi } = await import('../api/notificationApi');
      await markAllAsReadApi();
      
      // Cập nhật local state và emit từng notification
      this.notifications.forEach(n => {
        if (!n.read) {
          n.read = true;
          this.emit('notification_updated', n);
        }
      });
      
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
    }
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
        vehicle_verification: true,
        vehicle_verified: true,
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

  // Subscribe theo dõi cập nhật xe real-time (optional)
  subscribeToVehicleUpdates(vehicleIds = [], gateIds = []) {
    if (!this.socket || !this.isAuthenticated) {
      console.error('❌ Cannot subscribe to vehicle updates: socket not authenticated');
      return false;
    }

    console.log('🚗 Subscribing to vehicle updates...');
    console.log('🚗 Vehicle IDs:', vehicleIds);
    console.log('🚗 Gate IDs:', gateIds);

    this.subscribedVehicles = vehicleIds;
    this.subscribedGates = gateIds;

    this.socket.emit('subscribe_vehicle_updates', {
      vehicleIds: vehicleIds,
      gateIds: gateIds
    });

    return true;
  }

  // Hủy subscribe vehicle updates
  unsubscribeFromVehicleUpdates() {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    console.log('🚗 Unsubscribing from vehicle updates...');
    
    this.socket.emit('unsubscribe_vehicle_updates', {
      vehicleIds: this.subscribedVehicles,
      gateIds: this.subscribedGates
    });

    this.subscribedVehicles = [];
    this.subscribedGates = [];

    return true;
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
      this.reconnectAttempts = 0;
      this.subscribedVehicles = [];
      this.subscribedGates = [];
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
