import axiosClient from './axiosClient';

export const login = async (username, password) => {
  const response = await axiosClient.post('http://localhost:8000/api/auth/login', {
    username,
    password,
  });
  return response.data;
};
