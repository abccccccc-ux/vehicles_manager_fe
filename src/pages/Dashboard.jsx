import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import VideoPlayer from '../components/VideoPlayer';
import VehicleTable from './vehicles/VehicleTable';
import ChartStats from '../components/ChartStats';
import AlertMessage from '../components/AlertMessage';
import useCameras from '../hooks/useCameras';
import { AccessLogTable } from './access-log';

const Dashboard = () => {
  const [streamAlert, setStreamAlert] = useState('');
  const [alertType, setAlertType] = useState('info');
  const { cameras, loading, error, refreshCameras } = useCameras();

  const handleStreamStatus = (data) => {
    console.log('Stream status:', data);
    if (data.status === 'started') {
      setStreamAlert(`Camera ${data.cameraId} is now streaming`);
      setAlertType('success');
    } else if (data.status === 'error') {
      setStreamAlert(`Camera ${data.cameraId} error: ${data.message}`);
      setAlertType('error');
    }
  };

  const handleStreamError = (error) => {
    console.error('Stream error:', error);
    setStreamAlert(`Stream error: ${error.error || 'Unknown error'}`);
    setAlertType('error');
  };

  // Xử lý lỗi từ hook cameras
  React.useEffect(() => {
    if (error) {
      setStreamAlert(error);
      setAlertType('error');
    }
  }, [error]);

  return (
    <MainLayout>
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải camera...</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={refreshCameras}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Container cho cameras */}
      {cameras.length > 0 ? (
        <div className={
          cameras.length === 1 
            ? "mb-4" // 1 camera: không dùng grid, để VideoPlayer tự responsive
            : "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" // Nhiều cameras: 2 cột trên màn hình medium+
        }>
          {cameras.map((camera) => (
            <div key={camera._id || camera.id}>
              <h3 className="text-lg font-semibold mb-2">
                📹 {camera.name || `Camera ${camera.cameraId}`}
              </h3>
              <VideoPlayer 
                useWebSocket={true}
                cameraId={camera.cameraId || camera._id}
                cameraName={camera.name || `Camera ${camera.cameraId}`}
                quality="medium"
                showControls={true}
                showMetadata={true}
                onStreamStatus={handleStreamStatus}
                onError={handleStreamError}
              />
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8 mb-4">
            <div className="text-gray-500">
              <p className="text-lg">📹 Không có camera nào khả dụng</p>
              <p className="text-sm mt-2">Vui lòng kiểm tra kết nối hoặc cấu hình camera.</p>
            </div>
          </div>
        )
      )}
      
      {/* Stats Chart - Hiển thị riêng biệt */}
      {cameras.length > 0 && (
        <div className="mb-4">
          <ChartStats />
        </div>
      )}
      <AccessLogTable></AccessLogTable>
      
      {/* Stream Alert Messages */}
      {streamAlert && (
        <AlertMessage 
          type={alertType} 
          message={streamAlert} 
        />
      )}
    </MainLayout>
  );
};

export default Dashboard;
