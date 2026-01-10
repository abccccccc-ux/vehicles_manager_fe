import axiosClient from './axiosClient';

export const fetchNotifications = async (params = {}) => {
  // params: { page, itemsPerPage }
  const response = await axiosClient.get('/notifications/', { params });
  return response.data; // { success, message, data: [...], pagination }
};

export const markNotificationRead = async (id) => {
  // try common endpoint pattern
  const response = await axiosClient.put(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axiosClient.delete(`/notifications/${id}`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await axiosClient.put('/notifications/mark-all-read');
  return response.data;
};

export const fetchUnreadCount = async () => {
  const response = await axiosClient.get('/notifications/unread-count');
  return response.data; // { success, data: { count: number } }
};

export default {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  markAllAsReadApi,
  fetchUnreadCount,
};
