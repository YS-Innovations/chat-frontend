import React from 'react';
import { useUserStatus } from '@/context/UserStatusContext';

interface UserStatusIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({ 
  userId, 
  size = 'md',
  showText = false,
  className = ''
}) => {
  const { statuses } = useUserStatus();
  
  const status = Object.values(statuses).find(s => s.user?.auth0Id === userId);
  
  if (!status) {
    return (
      <span className={`flex items-center ${className}`}>
        <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
        {showText && <span className="text-xs text-gray-500">Loading...</span>}
      </span>
    );
  }

  const { isOnline, lastSeen } = status;
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span className={`flex items-center ${className}`}>
      <span 
        className={`${sizeClasses[size]} rounded-full mr-1 ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
        title={isOnline ? 'Online' : lastSeen ? `Last seen: ${lastSeen.toLocaleString()}` : 'Offline'}
      ></span>
      {showText && (
        <span className="text-xs text-gray-500">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  );
};