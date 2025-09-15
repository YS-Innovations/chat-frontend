// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthShared } from '@/hooks/useAuthShared';

type UserStatus = {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
};

type SocketContextType = {
  socket: Socket | null;
  userStatuses: Record<string, UserStatus>;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  userStatuses: {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
  const { getAccessTokenSilently, isAuthenticated } = useAuthShared();

  const initSocket = async () => {
    const token = await getAccessTokenSilently();
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}/user-status`, {
      path: '/socket.io',
      query: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to status service');
    });

    newSocket.on('initialStatuses', (statuses: UserStatus[]) => {
      const statusMap: Record<string, UserStatus> = {};
      statuses.forEach(status => {
        statusMap[status.userId] = {
          ...status,
          lastSeen: status.lastSeen ? new Date(status.lastSeen) : undefined,
        };
      });
      setUserStatuses(statusMap);
    });

    newSocket.on('statusUpdate', (update: {
      userId: string;
      isOnline: boolean;
      lastSeen?: string
    }) => {
      setUserStatuses(prev => ({
        ...prev,
        [update.userId]: {
          ...prev[update.userId],
          isOnline: update.isOnline,
          lastSeen: update.lastSeen ? new Date(update.lastSeen) : undefined,
        }
      }));
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from status service');
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <SocketContext.Provider value={{ socket, userStatuses }}>
      {children}
    </SocketContext.Provider>
  );
};