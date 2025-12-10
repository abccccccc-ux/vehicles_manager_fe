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
  },

  // Thêm camera mới
  createCamera: (cameraData) => {
    return axiosClient.post('/cameras', cameraData);
  },

  // Cập nhật camera
  updateCamera: (cameraId, cameraData) => {
    return axiosClient.put(`/cameras/${cameraId}`, cameraData);
  },

  // Xóa camera
  deleteCamera: (cameraId) => {
    return axiosClient.delete(`/cameras/${cameraId}`);
  }
};

export default cameraApi;
