// types.ts
export interface User {
  auth0Id: string;
  // add other user fields if necessary
}

export interface UserStatus {
  user?: User;
  isOnline: boolean;
  lastSeen?: Date | string;
}

export interface UserStatusIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onlineColor?: string;
  offlineColor?: string;
}
