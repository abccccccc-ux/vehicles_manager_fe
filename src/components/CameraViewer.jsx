import React, { useEffect, useRef, useState, useCallback } from 'react';
import videoStreamService from '../services/videoStreamService';
import './CameraViewer.css';

const CameraViewer = ({ 
  cameraId, 
  cameraName,
  quality = 'medium',
  autoStart = true,
  showControls = false,
  showMetadata = false,
  onStreamStatus,
  onError,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamStats, setStreamStats] = useState(null);
  const [error, setError] = useState(null);

  // Stream status handler
  const handleStreamStatus = useCallback((data) => {
    if (data.cameraId === cameraId) {
      console.log(`🎥 Stream status for ${cameraId}:`, data.status);
      
      if (data.status === 'started' || data.status === 'already_streaming') {
        setIsStreaming(true);
        setError(null);
      } else if (data.status === 'stopped') {
        setIsStreaming(false);
      } else if (data.status === 'error') {
        setError(data.message || 'Stream error');
        setIsStreaming(false);
      }
      
      if (onStreamStatus) {
        onStreamStatus(data);
      }
    }
  }, [cameraId, onStreamStatus]);

  // Connection status handler
  const handleConnectionStatus = useCallback((status) => {
    console.log(`📡 Connection status: ${status}`);
    setConnectionStatus(status);
  }, []);

  // Error handler
  const handleError = useCallback((errorData) => {
    console.error('❌ Stream error:', errorData);
    const errorMessage = errorData.error || errorData.message || 'Unknown error';
    setError(errorMessage);
    setIsStreaming(false);
    
    if (onError) {
      onError(errorData);
    }
  }, [onError]);

  // Frame update handler
  const handleFrameUpdate = useCallback((frameData) => {
    setStreamStats({
      timestamp: frameData.timestamp,
      frameNumber: frameData.frameNumber,
      metadata: frameData.metadata
    });
  }, []);

  // Setup effect
  useEffect(() => {
    console.log(`🎥 Setting up camera viewer for: ${cameraId}`);

    // Connect to service if not connected
    if (!videoStreamService.isConnectedToServer()) {
      videoStreamService.connect();
    }

    // Setup event listeners
    videoStreamService.on('connected', () => handleConnectionStatus('connected'));
    videoStreamService.on('disconnected', () => handleConnectionStatus('disconnected'));
    videoStreamService.on('reconnected', () => handleConnectionStatus('reconnected'));
    videoStreamService.on('stream_status', handleStreamStatus);
    videoStreamService.on('recognition_error', handleError);

    // Register canvas element
    if (canvasRef.current) {
      videoStreamService.registerVideoElement(cameraId, canvasRef.current, {
        autoResize: true,
        showMetadata: showMetadata,
        onFrameUpdate: handleFrameUpdate,
        onStreamStarted: () => setIsStreaming(true),
        onStreamStopped: () => setIsStreaming(false)
      });
    }

    return () => {
      // Cleanup
      videoStreamService.off('connected', handleConnectionStatus);
      videoStreamService.off('disconnected', handleConnectionStatus);
      videoStreamService.off('reconnected', handleConnectionStatus);
      videoStreamService.off('stream_status', handleStreamStatus);
      videoStreamService.off('recognition_error', handleError);
      
      // Stop streaming
      if (isStreaming) {
        videoStreamService.unsubscribeFromCameraStream(cameraId);
      }
    };
  }, [cameraId, showMetadata, handleConnectionStatus, handleStreamStatus, handleError, handleFrameUpdate, isStreaming]);

  // Auto start effect
  useEffect(() => {
    if (connectionStatus === 'connected' && autoStart && !isStreaming && !error) {
      startStream();
    }
  }, [connectionStatus, autoStart, isStreaming]);

  const startStream = useCallback(() => {
    console.log(`▶️ Starting stream for camera: ${cameraId} (${quality})`);
    setError(null);
    
    const success = videoStreamService.subscribeToCameraStream(cameraId, quality);
    if (!success) {
      setError('Failed to start stream - not connected to server');
    }
  }, [cameraId, quality]);

  const stopStream = useCallback(() => {
    console.log(`⏹️ Stopping stream for camera: ${cameraId}`);
    videoStreamService.unsubscribeFromCameraStream(cameraId);
    setIsStreaming(false);
    setStreamStats(null);
  }, [cameraId]);

  // Camera control functions
  const controlCamera = useCallback((command, value = 1) => {
    videoStreamService.controlCamera(cameraId, command, value);
  }, [cameraId]);

  // Status badge component
  const StatusBadge = () => {
    let statusClass = 'status-badge';
    let statusText = 'Disconnected';
    
    if (connectionStatus === 'connected') {
      if (isStreaming) {
        statusClass += ' status-streaming';
        statusText = 'Streaming';
      } else {
        statusClass += ' status-connected';
        statusText = 'Connected';
      }
    } else if (connectionStatus === 'disconnected') {
      statusClass += ' status-disconnected';
      statusText = 'Disconnected';
    }
    
    return <span className={statusClass}>{statusText}</span>;
  };

  return (
    <div className={`camera-viewer ${className}`}>
      {/* Header */}
      <div className="camera-header">
        <div className="camera-info">
          <h3 className="camera-name">{cameraName || `Camera ${cameraId}`}</h3>
          <StatusBadge />
        </div>
        
        <div className="camera-actions">
          {!isStreaming ? (
            <button 
              onClick={startStream}
              disabled={connectionStatus !== 'connected'}
              className="btn-start"
            >
              ▶️ Start
            </button>
          ) : (
            <button 
              onClick={stopStream}
              className="btn-stop"
            >
              ⏹️ Stop
            </button>
          )}
        </div>
      </div>

      {/* Video Canvas */}
      <div className="video-container">
        <canvas
          ref={canvasRef}
          className="video-canvas"
          style={{
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            backgroundColor: '#000',
            display: 'block'
          }}
        />
        
        {/* Overlay messages */}
        {error && (
          <div className="stream-overlay error-overlay">
            <div className="overlay-content">
              <span className="error-icon">❌</span>
              <p>{error}</p>
              <button onClick={startStream} className="btn-retry">
                🔄 Retry
              </button>
            </div>
          </div>
        )}
        
        {!isStreaming && !error && connectionStatus === 'connected' && (
          <div className="stream-overlay waiting-overlay">
            <div className="overlay-content">
              <span className="waiting-icon">⏳</span>
              <p>Waiting for stream...</p>
            </div>
          </div>
        )}
        
        {connectionStatus === 'disconnected' && (
          <div className="stream-overlay disconnected-overlay">
            <div className="overlay-content">
              <span className="disconnected-icon">📡</span>
              <p>Server disconnected</p>
              <p className="overlay-subtext">Trying to reconnect...</p>
            </div>
          </div>
        )}
      </div>

      {/* Stream Statistics */}
      {streamStats && showMetadata && (
        <div className="stream-stats">
          <div className="stats-row">
            <span>Quality: {streamStats.metadata?.quality}</span>
            <span>Resolution: {streamStats.metadata?.width}x{streamStats.metadata?.height}</span>
          </div>
          <div className="stats-row">
            <span>Clients: {streamStats.metadata?.clients}</span>
            <span>Frame: #{streamStats.metadata?.frameNumber}</span>
          </div>
          <div className="stats-row">
            <span>Last Update: {new Date(streamStats.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      {showControls && isStreaming && (
        <div className="camera-controls">
          <div className="control-section">
            <h4>Pan/Tilt</h4>
            <div className="ptz-controls">
              <div className="vertical-controls">
                <button className="control-btn" onClick={() => controlCamera('tilt_up')}>⬆️</button>
              </div>
              <div className="horizontal-controls">
                <button className="control-btn" onClick={() => controlCamera('pan_left')}>⬅️</button>
                <button className="control-btn home-btn" onClick={() => controlCamera('home')}>🏠</button>
                <button className="control-btn" onClick={() => controlCamera('pan_right')}>➡️</button>
              </div>
              <div className="vertical-controls">
                <button className="control-btn" onClick={() => controlCamera('tilt_down')}>⬇️</button>
              </div>
            </div>
          </div>
          
          <div className="control-section">
            <h4>Zoom</h4>
            <div className="zoom-controls">
              <button className="control-btn" onClick={() => controlCamera('zoom_in')}>🔍+</button>
              <button className="control-btn" onClick={() => controlCamera('zoom_out')}>🔍-</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraViewer;
