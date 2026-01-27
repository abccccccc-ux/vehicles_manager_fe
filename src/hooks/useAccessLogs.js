import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import accessLogService from '../services/accessLogService';
import { fetchAccessLogs } from '../store/accessLogSlice';

export const useAccessLogs = () => {
  const dispatch = useDispatch();
  const { 
    list: accessLogs, 
    loading, 
    error, 
    pagination 
  } = useSelector(state => state.accessLog);

  // Fetch access logs với custom params through Redux
  const fetchAccessLogsWithParams = useCallback((customParams = {}) => {
    dispatch(fetchAccessLogs(customParams));
  }, [dispatch]);

  // Refresh access logs (through service for real-time updates)
  const refreshAccessLogs = useCallback(() => {
    return accessLogService.fetchLatestAccessLogs();
  }, []);

  useEffect(() => {
    let debounceTimer;

    // Handler khi access logs được update từ socket
    const handleVehicleAccess = (data) => {
      console.log('🚗 Vehicle access notification received in hook');
      
      // Debounce fetch để tránh spam API
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        console.log('🔄 Refreshing access logs due to vehicle access...');
        // dispatch(fetchAccessLogs({})); // Dùng hàm này sẽ reset page về mặc định nếu không truyền params
        
        // Refresh giữ nguyên page hiện tại
        dispatch(fetchAccessLogs({
          page: pagination.current,
          limit: pagination.pageSize
        }));
      }, 1000);
    };

    // Register listeners for real-time updates from NotificationService
    // Vì accessLogService không trực tiếp quản lý socket events
    const { default: notificationService } = require('../services/notificationService');
    notificationService.on('vehicle_access', handleVehicleAccess);

    // Cleanup
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      notificationService.off('vehicle_access', handleVehicleAccess);
    };
  }, [dispatch, pagination.current, pagination.pageSize]);

  return {
    accessLogs,
    loading,
    error,
    totalCount: pagination.total,
    lastFetchTime: null, // Could be enhanced to track this
    fetchAccessLogs: fetchAccessLogsWithParams,
    refreshAccessLogs
  };
};
