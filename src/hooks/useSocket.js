import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...options
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('📡 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  return {
    socket: socketRef.current,
    isConnected,
    error
  };
};

// Hook specifically for video streaming
export const useVideoStream = (serverUrl = 'http://localhost:8000') => {
  const { socket, isConnected, error } = useSocket(serverUrl);
  const [streams, setStreams] = useState(new Map());

  const subscribeToCamera = (cameraId, quality = 'medium') => {
    if (!socket || !isConnected) return false;

    socket.emit('subscribe_camera_stream', {
      cameraIds: [cameraId],
      quality
    });

    return true;
  };

  const unsubscribeFromCamera = (cameraId) => {
    if (!socket || !isConnected) return false;

    socket.emit('unsubscribe_camera_stream', {
      cameraIds: [cameraId]
    });

    setStreams(prev => {
      const newStreams = new Map(prev);
      newStreams.delete(cameraId);
      return newStreams;
    });

    return true;
  };

  const controlCamera = (cameraId, command, value = 1) => {
    if (!socket || !isConnected) return false;

    socket.emit('camera_control', {
      cameraId,
      command,
      value
    });

    return true;
  };

  useEffect(() => {
    if (!socket) return;

    const handleVideoFrame = (data) => {
      const { cameraId, frame, timestamp, metadata } = data;
      setStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(cameraId, { frame, timestamp, metadata });
        return newStreams;
      });
    };

    const handleStreamStatus = (data) => {
      console.log('📊 Stream status:', data);
    };

    socket.on('video_frame', handleVideoFrame);
    socket.on('stream_status', handleStreamStatus);

    return () => {
      socket.off('video_frame', handleVideoFrame);
      socket.off('stream_status', handleStreamStatus);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    error,
    streams,
    subscribeToCamera,
    unsubscribeFromCamera,
    controlCamera
  };
};

export default useSocket;
