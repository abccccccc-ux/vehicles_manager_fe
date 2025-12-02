import axiosClient from './axiosClient';

const cameraApi = {
  // Lấy danh sách camera có thể stream
  getStreamableCameras: () => {
    return axiosClient.get('/cameras/streamable');
  },

  // Lấy thông tin chi tiết một camera
  getCameraById: (cameraId) => {
    return axiosClient.get(`/cameras/${cameraId}`);
  },

  // Lấy tất cả camera
  getAllCameras: () => {
    return axiosClient.get('/cameras');
  }
};

export default cameraApi;
