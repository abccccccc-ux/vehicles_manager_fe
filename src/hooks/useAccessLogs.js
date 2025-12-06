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
    // Handler khi access logs được update từ service
    const handleAccessLogsUpdated = (data) => {
      console.log('Access logs updated from service:', data.logs.length);
      // Service đã update, có thể trigger refresh Redux store nếu cần
      // dispatch(fetchAccessLogs({}));
    };

    // Register listeners for real-time updates
    accessLogService.on('vehicle_access', handleAccessLogsUpdated);

    // Cleanup
    return () => {
      accessLogService.off('vehicle_access', handleAccessLogsUpdated);
    };
  }, []);

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
