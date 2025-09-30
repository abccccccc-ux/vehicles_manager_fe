import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://vehicle-manage.vercel.app/api', // Thay đổi nếu cần
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm accessToken vào header (trừ login)
axiosClient.interceptors.request.use(
  (config) => {
    if (!config.url.includes('/auth/login')) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
