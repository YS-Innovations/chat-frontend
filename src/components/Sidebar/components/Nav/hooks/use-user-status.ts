// src/hooks/use-user-status.ts

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { io, Socket } from 'socket.io-client';

interface StatusUpdate {
  userId: string;
  isOnline: boolean;
  lastSeen: string | null;
}

export const useUserStatus = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let socket: Socket;

    const connectSocket = async () => {
      try {
        const token = await getAccessTokenSilently();
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        if (!baseUrl) {
          console.warn('⚠️ VITE_API_BASE_URL is not defined');
          return;
        }

        socket = io(`${baseUrl}/user-status`, {
          query: { token },
          transports: ['websocket'],
        });

        socket.on('connect', () => {
          console.log('✅ Connected to user-status socket');
        });

        socket.on('statusUpdate', (status: StatusUpdate) => {

          if (status.userId === user.sub) {
            setIsOnline(status.isOnline);
          }
        });

        socket.emit('join');
      } catch (error) {
        console.error('❌ Socket connection failed:', error);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('🔌 Disconnected from user-status socket');
      }
    };
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return { isOnline };
};
