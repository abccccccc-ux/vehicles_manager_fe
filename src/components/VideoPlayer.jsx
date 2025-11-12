import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import CameraViewer from './CameraViewer';

const VideoPlayer = ({ 
  src, 
  cameraId, 
  cameraName,
  useWebSocket = false, 
  quality = 'medium',
  showControls = false,
  showMetadata = false,
  onStreamStatus,
  onError 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Only use HLS if not using WebSocket
    if (!useWebSocket && videoRef.current && src) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        return () => {
          hls.destroy();
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
      }
    }
  }, [src, useWebSocket]);

  // If WebSocket streaming is enabled, use CameraViewer
  if (useWebSocket && cameraId) {
    return (
      <CameraViewer
        cameraId={cameraId}
        cameraName={cameraName}
        quality={quality}
        autoStart={true}
        showControls={showControls}
        showMetadata={showMetadata}
        onStreamStatus={onStreamStatus}
        onError={onError}
      />
    );
  }

  // Default HLS video player
  return <video ref={videoRef} controls style={{ width: '100%' }} />;
};

export default VideoPlayer;
