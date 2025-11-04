import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import VideoPlayer from '../components/VideoPlayer';
import VehicleTable from './vehicles/VehicleTable';
import ChartStats from '../components/ChartStats';
import AlertMessage from '../components/AlertMessage';

const Dashboard = () => {
  const [streamAlert, setStreamAlert] = useState('');
  const [alertType, setAlertType] = useState('info');

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

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* WebSocket Video Stream */}
        <div>
          <h3 className="text-lg font-semibold mb-2">📹 Live Camera Feed</h3>
          <VideoPlayer 
            useWebSocket={true}
            cameraId="camera1"
            cameraName="Main Gate Camera"
            quality="medium"
            showControls={true}
            showMetadata={true}
            onStreamStatus={handleStreamStatus}
            onError={handleStreamError}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">📹 Live Camera Feed</h3>
          <VideoPlayer 
            useWebSocket={true}
            cameraId="camera2"
            cameraName="Main Gate Camera"
            quality="medium"
            showControls={true}
            showMetadata={true}
            onStreamStatus={handleStreamStatus}
            onError={handleStreamError}
          />
        </div><div>
          <h3 className="text-lg font-semibold mb-2">📹 Live Camera Feed</h3>
          <VideoPlayer 
            useWebSocket={true}
            cameraId="camera3"
            cameraName="Main Gate Camera"
            quality="medium"
            showControls={true}
            showMetadata={true}
            onStreamStatus={handleStreamStatus}
            onError={handleStreamError}
          />
        </div>
        {/* Stats Chart */}
        <ChartStats />
      </div>
      <VehicleTable />
      
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
