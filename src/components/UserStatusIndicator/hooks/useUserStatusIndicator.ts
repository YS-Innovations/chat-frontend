// src/components/UserStatusIndicator/useUserStatusIndicator.ts
import { useMemo } from 'react';
import { useUserStatus } from '@/context/UserStatusContext';
import { formatDistanceToNow } from 'date-fns';
import type { UserStatus } from '../types/types';

export interface UseUserStatusIndicatorResult {
  status?: UserStatus;
  titleText: string;
  isOnline: boolean;
}

export function useUserStatusIndicator(userId: string): UseUserStatusIndicatorResult {
  const { statuses } = useUserStatus();

  const status: UserStatus | undefined = useMemo(() => {
    if (statuses[userId]) {
      return statuses[userId];
    }
    return Object.values(statuses).find((s) => s.user?.auth0Id === userId);
  }, [statuses, userId]);

  const isOnline = status?.isOnline ?? false;

  // Handle lastSeen as Date or string
  const lastSeenDate = status?.lastSeen
    ? status.lastSeen instanceof Date
      ? status.lastSeen
      : new Date(status.lastSeen)
    : null;

  const titleText = isOnline
    ? 'Online'
    : lastSeenDate
    ? `Last seen: ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`
    : 'Offline';

  return {
    status,
    titleText,
    isOnline,
  };
}
