import axiosClient from './axiosClient';

const departmentApi = {
  getDepartments: (params) =>
    axiosClient.get('/departments', { params }),
  // Có thể bổ sung thêm các API khác ở đây
};

export default departmentApi;
