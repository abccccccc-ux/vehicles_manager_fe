import axiosClient from './axiosClient';

// Lấy danh sách yêu cầu ra/vào giờ hành chính
// Hỗ trợ params: page, limit, status, requestType, search, fromDate, toDate
export const getWorkingHoursRequests = async (params) => {
  const response = await axiosClient.get('/working-hours-requests', { params });
  return response.data; // { success, message, data, pagination }
};

export default { getWorkingHoursRequests };
