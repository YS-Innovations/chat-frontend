import { Socket } from 'socket.io-client';

export interface UserStatus {
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

export interface UserStatusContextType {
  statuses: Record<string, UserStatus>;
  loading: boolean;
  socket: Socket | null;
}
