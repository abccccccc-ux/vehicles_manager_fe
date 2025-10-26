import axiosClient from './axiosClient';

// Lấy danh sách giờ làm việc, hỗ trợ params ví dụ: { isActive: true }
export const getWorkingHours = async (params) => {
  const response = await axiosClient.get('/working-hours', { params });
  return response.data; // { success, message, data, pagination }
};

// Tạo mới cấu hình giờ làm việc
export const createWorkingHours = async (payload) => {
  const response = await axiosClient.post('/working-hours', payload);
  return response.data; // { success, message, data }
};

export default { getWorkingHours, createWorkingHours };
