import axiosClient from './axiosClient';

// Lấy danh sách yêu cầu ra/vào giờ hành chính của người dùng hiện tại
// Endpoint mẫu: GET {{baseURL}}/api/working-hours-requests/my-requests
// Hỗ trợ params: page, limit, status, requestType, licensePlate, startDate, endDate
export const getWorkingHoursRequests = async (params) => {
  // axiosClient base URL usually points to /api
  const response = await axiosClient.get('/working-hours-requests/my-requests', { params });
  return response.data; // { success, message, data, pagination }
};

// Tạo yêu cầu ra/vào
// POST /api/working-hours-requests/
export const createWorkingHoursRequest = async (body) => {
  const response = await axiosClient.post('/working-hours-requests/', body);
  return response.data; // { success, message, data }
};
export default { getWorkingHoursRequests, createWorkingHoursRequest };
