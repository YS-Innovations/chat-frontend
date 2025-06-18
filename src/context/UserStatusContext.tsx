import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import io, { Socket } from 'socket.io-client';

interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
  user?: {
    id: string;
    auth0Id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

interface UserStatusContextType {
  statuses: Record<string, UserStatus>;
  loading: boolean;
  socket: Socket | null;
}

const UserStatusContext = createContext<UserStatusContextType>({
  statuses: {},
  loading: true,
  socket: null
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
      return;
    }

    const connectSocket = async () => {
      try {
        const token = await getAccessTokenSilently();
        const newSocket = io('http://localhost:3000/user-status', {
          query: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          setLoading(false);
        });

        newSocket.on('initialStatuses', (data: any[]) => {
          const statusMap: Record<string, UserStatus> = {};
          data.forEach(status => {
            statusMap[status.userId] = {
              ...status,
              lastSeen: status.lastSeen ? new Date(status.lastSeen) : undefined
            };
          });
          setStatuses(statusMap);
          setLoading(false);
        });

        newSocket.on('statusUpdate', (update: { userId: string; isOnline: boolean }) => {
          setStatuses(prev => ({
            ...prev,
            [update.userId]: {
              ...prev[update.userId],
              isOnline: update.isOnline,
              lastSeen: update.isOnline ? undefined : new Date()
            }
          }));
        });

      } catch (error) {
        setLoading(false);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <UserStatusContext.Provider value={{ 
      statuses, 
      loading,
      socket: socketRef.current
    }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = () => useContext(UserStatusContext);