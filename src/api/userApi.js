import axiosClient from './axiosClient';

const userApi = {
  getUsers: (params) => {
    // Normalize params: remove undefined entries and convert isActive to boolean
    const cleanParams = { ...params };
    if (cleanParams.search === undefined || cleanParams.search === '') delete cleanParams.search;
    if (cleanParams.role === undefined || cleanParams.role === '') delete cleanParams.role;
    if (cleanParams.isActive !== undefined) {
      // allow string 'true'/'false' or boolean
      if (typeof cleanParams.isActive === 'string') {
        cleanParams.isActive = cleanParams.isActive === 'true';
      } else {
        cleanParams.isActive = !!cleanParams.isActive;
      }
    } else {
      delete cleanParams.isActive;
    }
    return axiosClient.get('/users', { params: cleanParams });
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
