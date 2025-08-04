import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function useBackendHealth() {
  const [isBackendUp, setIsBackendUp] = useState(false);
  const [checking, setChecking] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Create socket with auto reconnect enabled by default
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true,            // try reconnecting
      reconnectionAttempts: Infinity, // unlimited retries
      reconnectionDelay: 1000,       // 1s between retries
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsBackendUp(true);
      setChecking(false);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsBackendUp(false);
      setChecking(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setIsBackendUp(false);
      setChecking(false);
    });

    newSocket.on('health', (data) => {
      setIsBackendUp(data.status === 'ok');
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return { isBackendUp, checking };
}
