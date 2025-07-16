// src/components/UserStatusIndicator.tsx
import React from 'react';
import { useSocket } from './SocketContext';

interface UserStatusIndicatorProps {
  userId: string;
  picture: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  userId,
  picture,
  name,
  size = 'md'
}) => {
  const { userStatuses } = useSocket();
  const status = userStatuses[userId];
  
  // Determine dot color
  const dotColor = status?.isOnline 
    ? 'bg-green-500' 
    : 'bg-gray-400';

  // Size classes
  const sizeClasses = {
    avatar: {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    },
    dot: {
      sm: 'w-2 h-2 bottom-0 right-0',
      md: 'w-2.5 h-2.5 bottom-0 right-0',
      lg: 'w-3 h-3 bottom-0 right-0'
    }
  };

  return (
    <div className="relative inline-block">
      <img 
        src={picture || `https://ui-avatars.com/api/?name=${name}&background=random`}
        alt={name}
        className={`rounded-full ${sizeClasses.avatar[size]}`}
      />
      {status && (
        <span className={`
          absolute 
          ${sizeClasses.dot[size]} 
          ${dotColor}
          rounded-full 
          border-2 
          border-white
        `} />
      )}
    </div>
  );
};

export default UserStatusIndicator;