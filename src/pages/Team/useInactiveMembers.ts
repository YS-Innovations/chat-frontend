import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { usePermissions } from '@/context/permissions';
import type { InactiveMember } from './types';

export function useInactiveMembers() {
  const { getAccessTokenSilently } = useAuth0();
  const { hasPermission, role } = usePermissions();
  
  const [inactiveMembers, setInactiveMembers] = useState<InactiveMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resending, setResending] = useState<Record<string, boolean>>({});

  const canViewInactive = role === 'ADMIN' || hasPermission('inactive-members-view');
  const canResend = role === 'ADMIN' || hasPermission('resend-invitation');

  const fetchInactiveMembers = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/inactive-members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch inactive members');

      const data = await response.json();
      setInactiveMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setResending(prev => ({ ...prev, [invitationId]: true }));
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/resend-invitation/${invitationId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend invitation');
      }

      fetchInactiveMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  useEffect(() => {
    if (canViewInactive) {
      fetchInactiveMembers();
    }
  }, [canViewInactive]);

  // Filter out accepted invitations
  const filteredMembers = inactiveMembers.filter(member => !member.usedAt);

  return {
    loading,
    error,
    members: filteredMembers,
    resending,
    canViewInactive,
    canResend,
    handleResend,
  };
}