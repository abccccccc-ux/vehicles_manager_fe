import io from 'socket.io-client';

class VideoStreamService {
  constructor() {
    this.socket = null;
    this.videoStreams = new Map(); // camera_id -> video_element
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = parseInt(process.env.REACT_APP_MAX_RECONNECT_ATTEMPTS) || 5;
    this.debugMode = process.env.REACT_APP_DEBUG_WEBSOCKET === 'true';
  }

  // Kết nối tới Node.js server
  connect(serverUrl = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:8000') {
    if (this.debugMode) {
      console.log('🔗 Connecting to video stream server...', serverUrl);
    }
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: parseInt(process.env.REACT_APP_RECONNECT_DELAY) || 1000
    });

    this.setupEventHandlers();
    return this.socket;
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to video stream server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Emit event để components biết đã kết nối
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 Disconnected from server:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.emit('reconnected', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to server');
      this.emit('reconnect_failed');
    });

    // Lắng nghe video frames
    this.socket.on('video_frame', (data) => {
      this.handleVideoFrame(data);
    });

    // Lắng nghe stream status
    this.socket.on('stream_status', (data) => {
      console.log('📊 Stream status:', data);
      this.emit('stream_status', data);
    });

    this.socket.on('camera_subscribed', (data) => {
      console.log('📺 Subscribed to cameras:', data.cameraIds);
      this.emit('camera_subscribed', data);
    });

    this.socket.on('camera_unsubscribed', (data) => {
      console.log('📴 Unsubscribed from cameras:', data.cameraIds);
      this.emit('camera_unsubscribed', data);
    });

    this.socket.on('python_server_status', (data) => {
      console.log('🐍 Python server status:', data);
      this.emit('python_server_status', data);
    });

    this.socket.on('camera_control_response', (data) => {
      console.log('🎮 Camera control response:', data);
      this.emit('camera_control_response', data);
    });

    this.socket.on('recognition_error', (data) => {
      console.error('❌ Recognition error:', data);
      this.emit('recognition_error', data);
    });
  }

  // Subscribe tới camera stream
  subscribeToCameraStream(cameraIds, quality = 'medium') {
    if (!this.isConnected) {
      console.error('❌ Not connected to server');
      return false;
    }

    const cameras = Array.isArray(cameraIds) ? cameraIds : [cameraIds];
    
    console.log(`📺 Subscribing to cameras: ${cameras.join(', ')} (${quality})`);

    this.socket.emit('subscribe_camera_stream', {
      cameraIds: cameras,
      quality
    });

    return true;
  }

  // Unsubscribe từ camera stream
  unsubscribeFromCameraStream(cameraIds) {
    if (!this.isConnected) return false;

    const cameras = Array.isArray(cameraIds) ? cameraIds : [cameraIds];
    
    console.log(`📴 Unsubscribing from cameras: ${cameras.join(', ')}`);

    this.socket.emit('unsubscribe_camera_stream', {
      cameraIds: cameras
    });

    // Clear video elements
    cameras.forEach(cameraId => {
      const videoElement = this.videoStreams.get(cameraId);
      if (videoElement && videoElement._streamOptions?.onStreamStopped) {
        videoElement._streamOptions.onStreamStopped();
      }
      this.videoStreams.delete(cameraId);
    });

    return true;
  }

  // Đăng ký video element để hiển thị stream
  registerVideoElement(cameraId, videoElement, options = {}) {
    console.log(`📱 Registering video element for camera: ${cameraId}`);
    
    // Lưu options để sử dụng sau
    videoElement._streamOptions = {
      autoResize: options.autoResize !== false,
      showMetadata: options.showMetadata === true,
      onFrameUpdate: options.onFrameUpdate,
      onStreamStarted: options.onStreamStarted,
      onStreamStopped: options.onStreamStopped,
      ...options
    };
    
    this.videoStreams.set(cameraId, videoElement);
  }

  // Xử lý video frame từ server
  handleVideoFrame(data) {
    const { cameraId, frame, timestamp, metadata } = data;
    const videoElement = this.videoStreams.get(cameraId);

    if (!videoElement) {
      // console.log(`⚠️ No video element registered for camera: ${cameraId}`);
      return;
    }

    try {
      // Tạo image data URL từ base64
      const imageData = `data:image/jpeg;base64,${frame}`;
      
      // Xử lý theo loại element
      if (videoElement.tagName === 'IMG') {
        videoElement.src = imageData;
        
        // Auto resize nếu được enable
        if (videoElement._streamOptions?.autoResize && metadata) {
          videoElement.style.width = '100%';
          videoElement.style.height = 'auto';
        }
        
      } else if (videoElement.tagName === 'CANVAS') {
        const ctx = videoElement.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Resize canvas nếu cần
          if (videoElement._streamOptions?.autoResize) {
            videoElement.width = img.width;
            videoElement.height = img.height;
          }
          
          // Vẽ frame lên canvas
          ctx.clearRect(0, 0, videoElement.width, videoElement.height);
          ctx.drawImage(img, 0, 0, videoElement.width, videoElement.height);
          
          // Vẽ metadata nếu được enable
          if (videoElement._streamOptions?.showMetadata && metadata) {
            this.drawMetadataOnCanvas(ctx, metadata, videoElement.width, videoElement.height);
          }
        };
        
        img.src = imageData;
      }

      // Gọi callback nếu có
      const options = videoElement._streamOptions;
      if (options?.onFrameUpdate) {
        options.onFrameUpdate({
          cameraId,
          timestamp,
          metadata,
          frameNumber: metadata?.frameNumber || 0
        });
      }

      // Cập nhật timestamp cho element
      videoElement._lastFrameTime = timestamp;
      
    } catch (error) {
      console.error(`❌ Error updating video frame for camera ${cameraId}:`, error);
    }
  }

  // Vẽ metadata lên canvas
  drawMetadataOnCanvas(ctx, metadata, width, height) {
    const fontSize = Math.max(12, Math.min(width / 40, 20));
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    const padding = 10;
    const lineHeight = fontSize + 4;
    let y = padding + fontSize;

    const info = [
      `Quality: ${metadata.quality}`,
      `Resolution: ${metadata.width}x${metadata.height}`,
      `Clients: ${metadata.clients}`,
      `Frame: ${metadata.frameNumber || 0}`
    ];

    info.forEach((text, index) => {
      const currentY = y + (index * lineHeight);
      ctx.strokeText(text, padding, currentY);
      ctx.fillStyle = 'white';
      ctx.fillText(text, padding, currentY);
    });
  }

  // Điều khiển camera
  controlCamera(cameraId, command, value = 1) {
    if (!this.isConnected) {
      console.error('❌ Not connected to server');
      return false;
    }

    console.log(`🎮 Camera control: ${cameraId} - ${command} (${value})`);

    this.socket.emit('camera_control', {
      cameraId,
      command,
      value
    });

    return true;
  }

  // Event emitter functionality
  _events = new Map();

  on(event, callback) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event).push(callback);
  }

  off(event, callback) {
    if (this._events.has(event)) {
      const callbacks = this._events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this._events.has(event)) {
      this._events.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // Lấy thống kê stream
  getStreamStats(cameraId) {
    const videoElement = this.videoStreams.get(cameraId);
    if (!videoElement) return null;

    return {
      cameraId,
      isRegistered: true,
      lastFrameTime: videoElement._lastFrameTime,
      isActive: Date.now() - (videoElement._lastFrameTime || 0) < 5000, // 5s timeout
      element: videoElement.tagName
    };
  }

  // Lấy tất cả stats
  getAllStreamStats() {
    const stats = {};
    this.videoStreams.forEach((element, cameraId) => {
      stats[cameraId] = this.getStreamStats(cameraId);
    });
    return stats;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('📡 Disconnecting from video stream server');
      
      // Unsubscribe from all streams
      const cameraIds = Array.from(this.videoStreams.keys());
      if (cameraIds.length > 0) {
        this.unsubscribeFromCameraStream(cameraIds);
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.videoStreams.clear();
      this._events.clear();
    }
  }

  // Kiểm tra trạng thái kết nối
  isConnectedToServer() {
    return this.isConnected && this.socket?.connected;
  }

  // Lấy thông tin kết nối
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io.engine.transport.name,
      activeStreams: this.videoStreams.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export default new VideoStreamService();
