import axiosClient from './axiosClient';

const userApi = {
  getUsers: (params) => {
    return axiosClient.get('/users', { params });
  },
  createUser: (data) => {
    return axiosClient.post('/users', data);
  },
};

export default userApi;
