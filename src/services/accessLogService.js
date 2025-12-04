import { getLatestAccessLogs } from '../api/accessLogApi';

class AccessLogService {
  constructor() {
    this.listeners = new Map();
    this.lastFetchTime = null;
    this.accessLogs = [];
  }

  // Fetch latest access logs và emit event
  async fetchLatestAccessLogs() {
    try {
      console.log('🔄 Fetching latest access logs...');
      
      const params = {
        page: 1,
        limit: 20,
        status: 'authorized',
        startDate: new Date().toISOString().split('T')[0]
      };

      const response = await getLatestAccessLogs(params);
      
      if (response.success) {
        this.accessLogs = response.data.items || response.data.accessLogs || [];
        this.lastFetchTime = new Date();
        
        // Emit event để notify các components
        this.emit('access_logs_updated', {
          logs: this.accessLogs,
          totalCount: response.data.totalCount || response.data.total || 0,
          fetchTime: this.lastFetchTime
        });
        
        console.log('✅ Access logs updated:', this.accessLogs.length, 'logs');
        return this.accessLogs;
      } else {
        console.error('❌ Failed to fetch access logs:', response.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching access logs:', error);
      this.emit('access_logs_error', { error: error.message });
      return null;
    }
  }

  // Fetch access logs với custom params
  async fetchAccessLogsWithParams(customParams = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 20,
        status: 'authorized',
        startDate: new Date().toISOString().split('T')[0]
      };

      const params = { ...defaultParams, ...customParams };
      const response = await getLatestAccessLogs(params);
      
      if (response.success) {
        const logs = response.data.items || response.data.accessLogs || [];
        
        this.emit('access_logs_fetched', {
          logs,
          totalCount: response.data.totalCount || response.data.total || 0,
          params,
          fetchTime: new Date()
        });
        
        return logs;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching access logs with params:', error);
      return null;
    }
  }

  // Lấy access logs hiện tại
  getCurrentAccessLogs() {
    return this.accessLogs;
  }

  // Lấy thời gian fetch cuối cùng
  getLastFetchTime() {
    return this.lastFetchTime;
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
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in access log service listener:', error);
        }
      });
    }
  }

  // Clear listeners
  clearListeners() {
    this.listeners.clear();
  }
}

// Export singleton instance
const accessLogService = new AccessLogService();
export default accessLogService;
