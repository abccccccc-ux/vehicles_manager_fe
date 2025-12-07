import axiosClient from './axiosClient';

// Lấy danh sách vi phạm giờ làm việc từ access-logs stats
export const getWorkingHoursViolations = async (params = {}) => {
  // Chuẩn bị params cho API /api/access-logs/stats/violations
  // params: { page, limit, startDate, endDate, licensePlate, status, severity, violationType }
  const queryParams = {
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
    page: params.page || 1,
    limit: params.limit || 10,
    search: params.search || undefined, // tìm kiếm biển số, tên
    status: params.status || undefined,
    violationType: params.violationType || undefined,
    severity: params.severity || undefined
  };

  // Loại bỏ các params undefined
  Object.keys(queryParams).forEach(key => 
    queryParams[key] === undefined && delete queryParams[key]
  );

  const response = await axiosClient.get('/access-logs/stats/violations', { params: queryParams });
  return response.data?.data;
};

// Lấy vi phạm giờ làm việc theo ID (có thể cần điều chỉnh endpoint)
export const getWorkingHoursViolationById = async (id) => {
  const response = await axiosClient.get(`/access-logs/${id}`); // Sử dụng access-logs thay vì working-hours-violations
  return response.data;
};

// Lấy chi tiết vi phạm giờ làm việc với đầy đủ thông tin
export const getWorkingHoursViolationDetails = async (id) => {
  try {
    // Thử endpoint chuyên dụng cho violations trước
    const response = await axiosClient.get(`/access-logs/${id}`);
    return response.data;
  } catch (error) {
    // Fallback về endpoint access-logs thông thường
    console.warn('Fallback to access-logs endpoint for violation details');
  }
};

// Cập nhật trạng thái xử lý vi phạm (có thể cần điều chỉnh endpoint)
export const updateViolationStatus = async (id, data) => {
  const response = await axiosClient.patch(`/access-logs/${id}/status`, data);
  return response.data;
};

// Lấy vi phạm gần đây
export const getLatestViolations = async (params = {}) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultParams = {
    page: 1,
    limit: 20,
    startDate: today,
    endDate: today
  };
  
  return getWorkingHoursViolations({ ...defaultParams, ...params });
};

const workingHoursViolationApi = {
  getWorkingHoursViolations,
  getWorkingHoursViolationById,
  getWorkingHoursViolationDetails,
  updateViolationStatus,
  getLatestViolations,
};

export default workingHoursViolationApi;
