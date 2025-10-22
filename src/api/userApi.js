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
  // editUser should accept (userId, data) and call PUT /users/:userId
  editUser: (userId, data) => {
    return axiosClient.put(`/users/${userId}`, data);
  },
  deleteUser: (userId) => {
    return axiosClient.delete(`/users/${userId}`);
  },
};

export default userApi;
