import axiosClient from './axiosClient';

// Lấy danh sách access logs
export const getAccessLogs = async (params = {}) => {
  // params: { page, limit, status, startDate, endDate, licensePlate, gateId, userId, departmentId }
  const response = await axiosClient.get('/access-logs', { params });
  return response.data;
};

// Lấy access log theo ID
export const getAccessLogById = async (id) => {
  const response = await axiosClient.get(`/access-logs/${id}`);
  return response.data;
};

// Lấy access logs gần đây (cho real-time updates)
export const getLatestAccessLogs = async (params = {}) => {
  const defaultParams = {
    page: 1,
    limit: 20,
    status: 'authorized',
    // Lấy từ hôm nay
    startDate: new Date().toISOString().split('T')[0]
  };
  
  return getAccessLogs({ ...defaultParams, ...params });
};

export default {
  getAccessLogs,
  getAccessLogById,
  getLatestAccessLogs
};
