import { useState, useEffect } from 'react';
import cameraApi from '../api/cameraApi';

const useCameras = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cameraApi.getStreamableCameras();
      setCameras(response.data.data || []);
    } catch (err) {
      console.error('Error fetching cameras:', err);
      setError('Không thể tải danh sách camera');
    } finally {
      setLoading(false);
    }
  };

  const refreshCameras = () => {
    fetchCameras();
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return {
    cameras,
    loading,
    error,
    refreshCameras
  };
};

export default useCameras;
