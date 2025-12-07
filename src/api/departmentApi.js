import axiosClient from './axiosClient';

const departmentApi = {
  getDepartments: (params) =>
    axiosClient.get('/departments', { params }),
  createDepartment: (data) =>
    axiosClient.post('/departments', data),
  deleteDepartment: (departmentId) =>
    axiosClient.delete(`/departments/${departmentId}`),
  getDepartmentById: (departmentId) =>
    axiosClient.get(`/departments/${departmentId}`),
  updateDepartment: (departmentId, data) =>
    axiosClient.put(`/departments/${departmentId}`, data),
  // Có thể bổ sung thêm các API khác ở đây
};

export default departmentApi;
