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

export const getVehicles = async (params = {}) => {
  // params: { search, vehicleType, status, page, limit, departmentId }
  const response = await axiosClient.get('/vehicles', { params });
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

export const updateVehicle = async (id, body) => {
  const response = await axiosClient.put(`/vehicles/${id}`, body);
  return response.data;
};

export const bulkUploadVehicles = async (excelFile) => {
  const formData = new FormData();
  formData.append('excelFile', excelFile);
  const response = await axiosClient.post('/bulk-vehicles/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Tải template Excel cho bulk upload
export const downloadVehicleTemplate = async () => {
  const response = await axiosClient.get('/bulk-vehicles/template', {
    responseType: 'blob',
  });
  
  // Tạo URL để download file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'vehicle_template.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true, message: 'Tải template thành công' };
};

const vehicleApi = { getVehicleByLicensePlate, getVehicles, createVehicle, getMyVehicles, updateVehicle, bulkUploadVehicles, downloadVehicleTemplate };

export default vehicleApi;
