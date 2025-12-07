import axiosClient from './axiosClient';

//cá nhân
export const getWorkingHoursRequests = async (params) => {
  const response = await axiosClient.get('/working-hours-requests/my-requests', { params });
  return response.data; // { success, message, data, pagination }
};

//admin quản lý
export const getAllWorkingHoursRequest = async (params) => {
  const response = await axiosClient.get('/working-hours-requests/', {params});
  return response.data;
}

// Tạo yêu cầu ra/vào
// POST /api/working-hours-requests/
export const createWorkingHoursRequest = async (body) => {
  const response = await axiosClient.post('/working-hours-requests/', body);
  return response.data; // { success, message, data }
};

// Cập nhật yêu cầu ra/vào (chỉ cho yêu cầu chưa được duyệt)
// PUT /api/working-hours-requests/:id
export const updateWorkingHoursRequest = async (id, body) => {
  const response = await axiosClient.put(`/working-hours-requests/${id}`, body);
  return response.data; // { success, message, data }
};
// Phê duyệt một yêu cầu
export const approveWorkingHoursRequest = async (id, body) => {
  const response = body !== undefined
    ? await axiosClient.put(`/working-hours-requests/${id}/approve`, body)
    : await axiosClient.put(`/working-hours-requests/${id}/approve`);
  return response.data; // { success, message, data }
};

// Từ chối một yêu cầu
export const rejectWorkingHoursRequest = async (id, body) => {
  const response = body !== undefined
    ? await axiosClient.put(`/working-hours-requests/${id}/reject`, body)
    : await axiosClient.put(`/working-hours-requests/${id}/reject`);
  return response.data;
};
const workingHoursRequestApi = {
  getWorkingHoursRequests,
  createWorkingHoursRequest,
  updateWorkingHoursRequest,
  getAllWorkingHoursRequest,
  approveWorkingHoursRequest,
  rejectWorkingHoursRequest,
};

export default workingHoursRequestApi;