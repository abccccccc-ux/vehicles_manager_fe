import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url) => {
  useEffect(() => {
    const socket = io(url);
    // Thêm các event handler mẫu ở đây
    return () => {
      socket.disconnect();
    };
  }, [url]);
};

export default useSocket;
