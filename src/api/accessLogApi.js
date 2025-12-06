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

// Xác minh access log
export const verifyAccessLog = async (id, data) => {
  const response = await axiosClient.put(`/access-logs/${id}/verify`, data);
  return response.data;
};

// Cập nhật thông tin access log
export const updateAccessLog = async (id, data) => {
  const response = await axiosClient.put(`/access-logs/${id}`, data);
  return response.data;
};

// Phê duyệt access log
export const approveAccessLog = async (id, data = {}) => {
  const response = await axiosClient.patch(`/access-logs/${id}/approve`, data);
  return response.data;
};

// Từ chối access log
export const rejectAccessLog = async (id, data = {}) => {
  const response = await axiosClient.patch(`/access-logs/${id}/reject`, data);
  return response.data;
};

export default {
  getAccessLogs,
  getAccessLogById,
  getLatestAccessLogs,
  verifyAccessLog,
  updateAccessLog,
  approveAccessLog,
  rejectAccessLog
};
