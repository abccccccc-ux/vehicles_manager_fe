import axiosClient from './axiosClient';

const userApi = {
  getUsers: (params) => {
    return axiosClient.get('/users', { params });
  },
  createUser: (data) => {
    return axiosClient.post('/users', data);
  },

  getUserById: (userId) => {
    return axiosClient.get(`/users/${userId}`);
  },
  editUser: (payload) => {
    return axiosClient.put('/auth/profile', payload);
  },
  deleteUser: (userId) => {
    return axiosClient.delete(`/users/${userId}`);
  },
};

export default userApi;
