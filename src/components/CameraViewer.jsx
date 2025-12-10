import React, { useEffect, useRef, useState, useCallback } from 'react';
import videoStreamService from '../services/videoStreamService';
import './CameraViewer.css';

const CameraViewer = ({ 
  cameraId, 
  cameraName,
  quality = 'medium',
  showControls = false,
  showMetadata = false,
  onStreamStatus,
  onError,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const isStreamingRef = useRef(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamStats, setStreamStats] = useState(null);
  const [error, setError] = useState(null);

  // Keep ref in sync with state
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Stream status handler
  const handleStreamStatus = useCallback((data) => {
    if (data.cameraId === cameraId) {
      console.log(`🎥 [${cameraId}] Stream status event:`, data.status);
      
      if (data.status === 'started' || data.status === 'already_streaming') {
        console.log(`✅ [${cameraId}] Setting isStreaming = true`);
        setIsStreaming(true);
        setError(null);
      } else if (data.status === 'stopped') {
        console.log(`⏹️ [${cameraId}] Setting isStreaming = false`);
        setIsStreaming(false);
      } else if (data.status === 'error') {
        console.log(`❌ [${cameraId}] Stream error:`, data.message);
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
    // If we're receiving frames, the stream is definitely active
    if (!isStreamingRef.current) {
      console.log(`🎬 [${cameraId}] Frame received but isStreaming=false, correcting state`);
      setIsStreaming(true);
    }
    
    setStreamStats({
      timestamp: frameData.timestamp,
      frameNumber: frameData.frameNumber,
      metadata: frameData.metadata
    });
  }, [cameraId]);

  // Setup effect
  useEffect(() => {
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
        onStreamStarted: () => {
          console.log(`🎬 [${cameraId}] Canvas onStreamStarted callback`);
          setIsStreaming(true);
        },
        onStreamStopped: () => {
          console.log(`🛑 [${cameraId}] Canvas onStreamStopped callback`);
          setIsStreaming(false);
        }
      });
    }

    return () => {
      console.log(`🧹 [${cameraId}] Cleaning up event listeners`);
      // Cleanup
      videoStreamService.off('connected', handleConnectionStatus);
      videoStreamService.off('disconnected', handleConnectionStatus);
      videoStreamService.off('reconnected', handleConnectionStatus);
      videoStreamService.off('stream_status', handleStreamStatus);
      videoStreamService.off('recognition_error', handleError);
      
      // Stop streaming when component unmounts
      videoStreamService.unsubscribeFromCameraStream(cameraId);
    };
  }, [cameraId, showMetadata, handleConnectionStatus, handleStreamStatus, handleError, handleFrameUpdate]);

  // Auto start stream when connected
  useEffect(() => {
    console.log(`🔄 [${cameraId}] Auto-start check:`, {
      connectionStatus,
      isStreaming,
      error: !!error
    });
    
    if (connectionStatus === 'connected' && !isStreaming && !error) {
      console.log(`🚀 [${cameraId}] Subscribing to camera stream`);
      const success = videoStreamService.subscribeToCameraStream(cameraId, quality);
      console.log(`📡 [${cameraId}] Subscribe result:`, success);
      
      if (!success) {
        setError('Failed to start stream - not connected to server');
      }
    }
  }, [connectionStatus, isStreaming, error, cameraId, quality]);



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

  // Debug render state
  console.log(`📊 [${cameraId}] Render state:`, {
    isStreaming,
    error: !!error,
    connectionStatus,
    streamStats: !!streamStats,
    showWaitingOverlay: !isStreaming && !error && connectionStatus === 'connected'
  });

  return (
    <div className={`camera-viewer ${className}`}>
      {/* Header */}
      <div className="camera-header">
        <div className="camera-info">
          <h3 className="camera-name">{cameraName || `Camera ${cameraId}`}</h3>
          <StatusBadge />
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
            </div>
          </div>
        )}
        
        {!isStreaming && !error && connectionStatus === 'connected' && (() => {
          console.log(`⏳ [${cameraId}] Showing waiting overlay - Debug state check`);
          return (
            <div className="stream-overlay waiting-overlay">
              <div className="overlay-content">
                <span className="waiting-icon">⏳</span>
                <p>Waiting for stream...</p>
                <small style={{fontSize: '0.8em', opacity: 0.7}}>
                  Debug: streaming={isStreaming.toString()}, error={(!!error).toString()}
                </small>
              </div>
            </div>
          );
        })()}
        
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
    </div>
  );
};

export default CameraViewer;
