import axiosClient from './axiosClient';

// Lấy thông tin xe theo biển số
export const getVehicleByLicensePlate = async (licensePlate) => {
  const response = await axiosClient.get(`/vehicles/license-plate/${licensePlate}`);
  // Trả về { success, message, data: vehicle }
  if (response.data.success) {
    return {
      success: true,
      message: response.data.message,
      data: response.data.data.vehicle,
    };
  }
  return response.data;
};

export const getVehicles = async () => {
  const response = await axiosClient.get('/vehicles');
  return response.data;
};

// Lấy danh sách xe của người dùng hiện tại (personal vehicles)
export const getMyVehicles = async (params) => {
  // params may include page, limit, search, etc.
  const response = await axiosClient.get('/vehicles/my-vehicles', { params });
  return response.data;
};

export const createVehicle = async (body) => {
  const response = await axiosClient.post('/vehicles', body);
  return response.data;
};

export default { getVehicleByLicensePlate, getVehicles, createVehicle, getMyVehicles };
