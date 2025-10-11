import axiosClient from './axiosClient';

// Lấy danh sách giờ làm việc, hỗ trợ params ví dụ: { isActive: true }
export const getWorkingHours = async (params) => {
  const response = await axiosClient.get('/working-hours', { params });
  return response.data; // { success, message, data, pagination }
};

export default { getWorkingHours };
