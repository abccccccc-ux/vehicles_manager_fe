import axiosClient from './axiosClient';


export const login = async (username, password) => {
  const response = await axiosClient.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await axiosClient.post('/auth/refresh-token', {
    refreshToken,
  });
  return response.data;
};

// Đổi mật khẩu
export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await axiosClient.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

