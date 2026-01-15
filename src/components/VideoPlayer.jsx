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
      // Check if it's a regular video file (MP4, WebM, OGG)
      const isRegularVideo = src.match(/\.(mp4|webm|ogg)$/i);
      
      if (isRegularVideo) {
        // Use native HTML5 video player for regular video files
        videoRef.current.src = src;
      } else if (Hls.isSupported()) {
        // Use HLS.js for HLS streaming (.m3u8)
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS Error:', data);
            if (onError) {
              onError(data);
            }
          }
        });
        
        return () => {
          hls.destroy();
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for Safari native HLS support
        videoRef.current.src = src;
      }
    }
  }, [src, useWebSocket, onError]);

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
