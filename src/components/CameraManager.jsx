import React, { useState, useEffect } from 'react';
import videoStreamService from '../services/videoStreamService';
import './CameraManager.css';

const CameraManager = ({ cameras = [], onCameraSelect, selectedCameraId }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamStats, setStreamStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup event listeners
    const handleConnection = () => setConnectionStatus('connected');
    const handleDisconnection = () => setConnectionStatus('disconnected');
    const handleStreamStatus = (data) => {
      setStreamStats(prev => ({
        ...prev,
        [data.cameraId]: data
      }));
    };

    videoStreamService.on('connected', handleConnection);
    videoStreamService.on('disconnected', handleDisconnection);
    videoStreamService.on('stream_status', handleStreamStatus);

    return () => {
      videoStreamService.off('connected', handleConnection);
      videoStreamService.off('disconnected', handleDisconnection);
      videoStreamService.off('stream_status', handleStreamStatus);
    };
  }, []);

  const handleCameraClick = (camera) => {
    if (onCameraSelect) {
      onCameraSelect(camera);
    }
  };

  const handleStreamToggle = (camera, isStreaming) => {
    setLoading(true);
    
    if (isStreaming) {
      videoStreamService.unsubscribeFromCameraStream(camera.cameraId);
    } else {
      videoStreamService.subscribeToCameraStream(camera.cameraId, 'medium');
    }
    
    setTimeout(() => setLoading(false), 1000);
  };

  const getCameraStatus = (cameraId) => {
    const stats = streamStats[cameraId];
    if (!stats) return 'idle';
    
    switch (stats.status) {
      case 'started':
      case 'already_streaming':
        return 'streaming';
      case 'stopped':
        return 'stopped';
      case 'error':
        return 'error';
      default:
        return 'idle';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'streaming': return '🟢';
      case 'stopped': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'streaming': return 'Streaming';
      case 'stopped': return 'Stopped';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };

  return (
    <div className="camera-manager">
      <div className="camera-manager-header">
        <div className="header-info">
          <h3>📹 Camera Manager</h3>
          <span className={`connection-indicator ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => videoStreamService.connect()}
            disabled={connectionStatus === 'connected' || loading}
            className="btn-connect"
          >
            🔄 Connect
          </button>
          <button 
            onClick={() => videoStreamService.disconnect()}
            disabled={connectionStatus === 'disconnected' || loading}
            className="btn-disconnect"
          >
            🔌 Disconnect
          </button>
        </div>
      </div>

      <div className="camera-list">
        {cameras.length === 0 ? (
          <div className="empty-state">
            <p>📷 No cameras configured</p>
            <small>Add cameras to start streaming</small>
          </div>
        ) : (
          cameras.map(camera => {
            const status = getCameraStatus(camera.cameraId);
            const isSelected = selectedCameraId === camera.cameraId;
            const isStreaming = status === 'streaming';
            
            return (
              <div 
                key={camera.cameraId}
                className={`camera-item ${isSelected ? 'selected' : ''} ${status}`}
                onClick={() => handleCameraClick(camera)}
              >
                <div className="camera-info">
                  <div className="camera-header">
                    <span className="camera-name">{camera.name}</span>
                    <span className="camera-status">
                      {getStatusIcon(status)} {getStatusText(status)}
                    </span>
                  </div>
                  
                  <div className="camera-details">
                    <small>ID: {camera.cameraId}</small>
                    {camera.location && <small>📍 {camera.location}</small>}
                    {streamStats[camera.cameraId] && (
                      <small>
                        Quality: {streamStats[camera.cameraId].quality || 'medium'}
                      </small>
                    )}
                  </div>
                </div>
                
                <div className="camera-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStreamToggle(camera, isStreaming);
                    }}
                    disabled={connectionStatus !== 'connected' || loading}
                    className={`btn-stream ${isStreaming ? 'streaming' : 'stopped'}`}
                  >
                    {isStreaming ? '⏹️' : '▶️'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {cameras.length > 0 && (
        <div className="camera-manager-footer">
          <div className="bulk-actions">
            <button
              onClick={() => {
                setLoading(true);
                cameras.forEach(camera => {
                  videoStreamService.subscribeToCameraStream(camera.cameraId, 'medium');
                });
                setTimeout(() => setLoading(false), 2000);
              }}
              disabled={connectionStatus !== 'connected' || loading}
              className="btn-start-all"
            >
              ▶️ Start All
            </button>
            
            <button
              onClick={() => {
                setLoading(true);
                cameras.forEach(camera => {
                  videoStreamService.unsubscribeFromCameraStream(camera.cameraId);
                });
                setTimeout(() => setLoading(false), 1000);
              }}
              disabled={connectionStatus !== 'connected' || loading}
              className="btn-stop-all"
            >
              ⏹️ Stop All
            </button>
          </div>
          
          <div className="stats-summary">
            <small>
              Total: {cameras.length} | 
              Streaming: {Object.values(streamStats).filter(s => s.status === 'started' || s.status === 'already_streaming').length} |
              Errors: {Object.values(streamStats).filter(s => s.status === 'error').length}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraManager;
