import axiosClient from './axiosClient';

const departmentApi = {
  getDepartments: (params) =>
    axiosClient.get('/departments', { params }),
  deleteDepartment: (departmentId) =>
    axiosClient.delete(`/departments/${departmentId}`),
  getDepartmentById: (departmentId) =>
    axiosClient.get(`/departments/${departmentId}`),
  // Có thể bổ sung thêm các API khác ở đây
};

export default departmentApi;
