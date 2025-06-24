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
  socket: null,
});

export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>({});
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      // If user is not authenticated, clean up socket and reset states
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Function to connect socket with retry and proper error handling
    const connectSocket = async () => {
      try {
        // Wait for the Auth0 token
        const token = await getAccessTokenSilently();

        // Create socket connection
        const newSocket = io('http://localhost:3000/user-status', {
          query: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,   // Increase attempts
          reconnectionDelay: 10000,    // Wait 2 seconds between retries
        });

        socketRef.current = newSocket;

        // When connected
        newSocket.on('connect', () => {
          console.log('Socket connected');
          if (isMounted) setLoading(false);
        });

        // Handle connection errors and try to reconnect
        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (isMounted) setLoading(true); // Keep loading true during retry
        });

        // Initial user statuses event from server
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

        // Real-time updates for user status
        newSocket.on('statusUpdate', (update: { userId: string; isOnline: boolean }) => {
          if (!isMounted) return;
          setStatuses(prev => ({
            ...prev,
            [update.userId]: {
              ...prev[update.userId],
              isOnline: update.isOnline,
              lastSeen: update.isOnline ? undefined : new Date(),
            }
          }));
        });

      } catch (error) {
        console.error('Failed to get token or connect socket:', error);
        if (isMounted) setLoading(false);
      }
    };

    // Delay connection by 1 second to give backend time to start (optional but recommended)
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

export const useUserStatus = () => useContext(UserStatusContext);