import axiosClient from './axiosClient';

export const getVehicles = async () => {
  // Gọi API lấy danh sách xe
  const response = await axiosClient.get('/vehicles');
  return response.data;
};
