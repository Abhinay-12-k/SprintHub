import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (projectId) => {
  const socketRef = useRef();

  useEffect(() => {
    // In production, this would be your server URL
    socketRef.current = io(window.location.origin.replace('3000', '5000'), {
      transports: ['websocket'],
    });

    if (projectId) {
      socketRef.current.emit('join-project', projectId);
    }

    return () => {
      if (projectId) {
        socketRef.current.emit('leave-project', projectId);
      }
      socketRef.current.disconnect();
    };
  }, [projectId]);

  return socketRef.current;
};

export default useSocket;
