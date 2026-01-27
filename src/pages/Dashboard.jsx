import React from 'react';
import MainLayout from '../layouts/MainLayout';
import WebRTCPlayer from '../components/WebRTCPlayer';
import useCameras from '../hooks/useCameras';
import { AccessLogTable } from './access-log';

const Dashboard = () => {
  const { cameras, loading, error, refreshCameras } = useCameras();

  const handleStreamError = (error) => {
    console.error('Stream error:', error);
  };

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
        <div 
          style={
            cameras.length === 1 
              ? { marginBottom: '16px' }
              : {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }
          }
        >
          {cameras.map((camera) => (
            <div key={camera._id || camera.id}>
              <WebRTCPlayer 
                cameraId={camera.cameraId || camera._id}
                cameraName={camera.name || `Camera ${camera.cameraId}`}
                mediamtxUrl={process.env.REACT_APP_MEDIAMTX_URL || 'http://localhost:8889'}
                autoPlay={true}
                controls={true}
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
      <AccessLogTable></AccessLogTable>
    </MainLayout>
  );
};

export default Dashboard;
