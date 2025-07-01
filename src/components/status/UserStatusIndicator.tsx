// UserStatusIndicator.tsx
import React, { useMemo } from 'react';
import { useUserStatus } from '@/context/UserStatusContext';
import { formatDistanceToNow } from 'date-fns';
import type { UserStatus, UserStatusIndicatorProps } from './types';

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  userId,
  size = 'md',
  showText = false,
  className = '',
  onlineColor = 'bg-green-500',
  offlineColor = 'bg-gray-400',
}) => {
  const { statuses } = useUserStatus();

  const status: UserStatus | undefined = useMemo(() => {
    if (statuses[userId]) {
      return statuses[userId];
    }
    return Object.values(statuses).find((s) => s.user?.auth0Id === userId);
  }, [statuses, userId]);

  if (!status) {
    return (
      <span className={`flex items-center ${className}`} aria-label="Loading user status">
        <span className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></span>
        {showText && <span className="text-xs text-gray-500">Loading...</span>}
      </span>
    );
  }

  const { isOnline, lastSeen } = status;
  const lastSeenDate = lastSeen ? new Date(lastSeen) : null;

  const titleText = isOnline
    ? 'Online'
    : lastSeenDate
    ? `Last seen: ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`
    : 'Offline';

  return (
    <span
      className={`flex items-center ${className}`}
      aria-label={titleText}
      role="status"
      aria-live="polite"
    >
      <span
        className={`${sizeClasses[size]} rounded-full mr-1 ${
          isOnline ? onlineColor : offlineColor
        }`}
        title={titleText}
      />
      {showText && (
        <span className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
      )}
    </span>
  );
};
