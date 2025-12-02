import axios from 'axios';
import store from '../store/store';
import { logout, loginSuccess } from '../store/authSlice';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
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

// Refresh token + retry flow
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (originalRequest && originalRequest.url && originalRequest.url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (response && response.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid trying to refresh while the refresh endpoint itself failed
      if (originalRequest.url && originalRequest.url.includes('/auth/refresh-token')) {
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        } catch (e) {}
        try { store.dispatch(logout()); } catch (e) {}
        try { window.location.replace('/login'); } catch (e) {}
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        } catch (e) {}
        try { store.dispatch(logout()); } catch (e) {}
        try { window.location.replace('/login'); } catch (e) {}
        return Promise.reject(error);
      }

      try {
        const refreshUrl = `${axiosClient.defaults.baseURL}/auth/refresh-token`;
        const resp = await axios.post(refreshUrl, { refreshToken });
        const tokens = resp?.data?.data?.tokens;
        const newAccessToken = tokens?.accessToken;
        const newRefreshToken = tokens?.refreshToken;

        if (!newAccessToken) throw new Error('No new access token');

        try {
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        } catch (e) {}

        // Update redux state (keep existing user if available)
        let user = null;
        try {
          const userStr = localStorage.getItem('user');
          user = userStr ? JSON.parse(userStr) : null;
        } catch (e) {
          user = null;
        }
        try {
          store.dispatch(loginSuccess({ user, tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } }));
        } catch (e) {}

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        } catch (e) {}
        try { store.dispatch(logout()); } catch (e) {}
        try { window.location.replace('/login'); } catch (e) {}
        return Promise.reject(err || error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
