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

// Xóa cấu hình giờ làm việc theo id
export const deleteWorkingHours = async (id) => {
  const response = await axiosClient.delete(`/working-hours/${id}`);
  return response.data; // { success, message }
};

// Cập nhật giờ làm việc theo id
export const updateWorkingHours = async (workingHourId, payload) => {
  const response = await axiosClient.put(`/working-hours/${workingHourId}`, payload);
  return response.data; // { success, message, data }
};
export default { getWorkingHours, createWorkingHours, deleteWorkingHours, updateWorkingHours };
