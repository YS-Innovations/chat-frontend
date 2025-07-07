import React, { createContext, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import io, { Socket } from 'socket.io-client';
import type { UserStatus, UserStatusContextType } from './types/types';

export const UserStatusContext = createContext<UserStatusContextType>({
  statuses: {},
  loading: true,
  socket: null,
});

export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>({});
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setLoading(false);
      return;
    }

    let isMounted = true;

    const connectSocket = async () => {
      try {
        const token = await getAccessTokenSilently();

        const newSocket = io('http://localhost:3000/user-status', {
          query: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 10000,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          if (isMounted) setLoading(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (isMounted) setLoading(true);
        });

        newSocket.on('initialStatuses', (data: any[]) => {
          if (!isMounted) return;
          const statusMap: Record<string, UserStatus> = {};
          data.forEach(status => {
            statusMap[status.userId] = {
              ...status,
              lastSeen: status.lastSeen ? new Date(status.lastSeen) : undefined,
            };
          });
          setStatuses(statusMap);
          setLoading(false);
        });

        newSocket.on('statusUpdate', (update: { userId: string; isOnline: boolean }) => {
          if (!isMounted) return;
          setStatuses(prev => ({
            ...prev,
            [update.userId]: {
              ...prev[update.userId],
              isOnline: update.isOnline,
              lastSeen: update.isOnline ? undefined : new Date(),
            },
          }));
        });

      } catch (error) {
        console.error('Failed to get token or connect socket:', error);
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (isMounted) connectSocket();
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <UserStatusContext.Provider value={{ statuses, loading, socket: socketRef.current }}>
      {children}
    </UserStatusContext.Provider>
  );
};
