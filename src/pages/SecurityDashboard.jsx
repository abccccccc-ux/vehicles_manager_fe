import React, { useState, useCallback } from 'react';
import CameraViewer from '../components/CameraViewer';
import CameraManager from '../components/CameraManager';
import videoStreamService from '../services/videoStreamService';
import AlertMessage from '../components/AlertMessage';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');  
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [selectedCameraId, setSelectedCameraId] = useState(null);

  // Sample cameras - replace with your actual camera data
  const cameras = [
    { id: 'camera_001', name: 'Cổng chính - Vào', location: 'Main Gate', streamUrl: 'rtsp://192.168.1.100:554/stream' },
    { id: 'camera_002', name: 'Cổng chính - Ra', location: 'Exit Gate', streamUrl: 'rtsp://192.168.1.101:554/stream' },
    { id: 'camera_003', name: 'Cổng phụ', location: 'Side Gate', streamUrl: 'rtsp://192.168.1.102:554/stream' },
    { id: 'camera_004', name: 'Bãi đỗ xe', location: 'Parking Lot', streamUrl: 'rtsp://192.168.1.103:554/stream' },
  ];

  const handleStreamStatus = useCallback((data) => {
    console.log(`Stream status for ${data.cameraId}:`, data.status);
    
    let message = '';
    let type = 'info';
    
    switch (data.status) {
      case 'started':
        message = `Camera ${data.cameraId} started streaming`;
        type = 'success';
        break;
      case 'stopped':
        message = `Camera ${data.cameraId} stopped streaming`;
        type = 'warning';
        break;
      case 'error':
        message = `Camera ${data.cameraId} error: ${data.message}`;
        type = 'error';
        break;
      default:
        message = `Camera ${data.cameraId}: ${data.status}`;
    }
    
    setAlertMessage(message);
    setAlertType(type);
  }, []);

  const handleStreamError = useCallback((error) => {
    console.error('Stream error:', error);
    setAlertMessage(`Stream error: ${error.error || error.message || 'Unknown error'}`);
    setAlertType('error');
  }, []);

  const updateConnectionInfo = useCallback(() => {
    const info = videoStreamService.getConnectionInfo();
    setConnectionInfo(info);
  }, []);

  const disconnectAll = useCallback(() => {
    videoStreamService.disconnect();
    setAlertMessage('Disconnected from streaming server');
    setAlertType('warning');
    updateConnectionInfo();
  }, [updateConnectionInfo]);

  const reconnect = useCallback(() => {
    videoStreamService.connect();
    setAlertMessage('Reconnecting to streaming server...');
    setAlertType('info');
    setTimeout(updateConnectionInfo, 1000);
  }, [updateConnectionInfo]);

  // Update connection info periodically
  React.useEffect(() => {
    const interval = setInterval(updateConnectionInfo, 2000);
    updateConnectionInfo(); // Initial update
    
    return () => clearInterval(interval);
  }, [updateConnectionInfo]);

  return (
    <div className="security-dashboard">
      <div className="dashboard-header">
        <h1>🎥 Security Dashboard</h1>
        
        <div className="connection-panel">
          <div className="connection-info">
            <span className={`connection-status ${connectionInfo?.connected ? 'connected' : 'disconnected'}`}>
              {connectionInfo?.connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {connectionInfo?.connected && (
              <small>
                Transport: {connectionInfo.transport} | 
                Active Streams: {connectionInfo.activeStreams} |
                Socket ID: {connectionInfo.socketId?.substring(0, 8)}...
              </small>
            )}
          </div>
          
          <div className="connection-actions">
            <button onClick={updateConnectionInfo} className="btn-info">
              📊 Refresh
            </button>
            <button onClick={reconnect} className="btn-success">
              🔄 Reconnect
            </button>
            <button onClick={disconnectAll} className="btn-danger">
              🔌 Disconnect
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="camera-sidebar">
          <CameraManager
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            onCameraSelect={(camera) => setSelectedCameraId(camera.id)}
          />
        </div>
        
        <div className="camera-main">
          {selectedCameraId ? (
            <div className="selected-camera">
              <CameraViewer
                cameraId={selectedCameraId}
                cameraName={cameras.find(c => c.id === selectedCameraId)?.name}
                quality="high"
                autoStart={true}
                showControls={true}
                showMetadata={true}
                onStreamStatus={handleStreamStatus}
                onError={handleStreamError}
                className="main-camera-viewer"
              />
            </div>
          ) : (
            <div className="no-camera-selected">
              <div className="placeholder-content">
                <span className="placeholder-icon">📹</span>
                <h3>Select a camera to view</h3>
                <p>Choose a camera from the list to start streaming</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="camera-grid">
        {cameras.map(camera => (
          <div key={camera.id} className="camera-item">
            <CameraViewer
              cameraId={camera.id}
              cameraName={camera.name}
              quality="medium"
              autoStart={false}
              showControls={false}
              showMetadata={false}
              onStreamStatus={handleStreamStatus}
              onError={handleStreamError}
              className="dashboard-camera"
            />
          </div>
        ))}
      </div>

      <div className="dashboard-controls">
        <h3>🎛️ Global Controls</h3>
        <div className="control-buttons">
          <button 
            onClick={() => {
              cameras.forEach(camera => {
                videoStreamService.subscribeToCameraStream(camera.id, 'medium');
              });
              setAlertMessage('Starting all camera streams...');
              setAlertType('info');
            }}
            className="btn-success"
          >
            ▶️ Start All Streams
          </button>
          
          <button 
            onClick={() => {
              cameras.forEach(camera => {
                videoStreamService.unsubscribeFromCameraStream(camera.id);
              });
              setAlertMessage('Stopping all camera streams...');
              setAlertType('warning');
            }}
            className="btn-warning"
          >
            ⏹️ Stop All Streams
          </button>
          
          <button 
            onClick={() => {
              const stats = videoStreamService.getAllStreamStats();
              console.log('📊 Stream Statistics:', stats);
              setAlertMessage('Stream statistics logged to console');
              setAlertType('info');
            }}
            className="btn-info"
          >
            📊 View Stats
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <AlertMessage 
          type={alertType} 
          message={alertMessage} 
        />
      )}
    </div>
  );
};

export default SecurityDashboard;
