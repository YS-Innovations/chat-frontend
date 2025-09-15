import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { usePermissions } from '@/context/permissions';
import type { InactiveMember } from '../types/types';

export function useInactiveMembers() {
  const { getAccessTokenSilently } = useAuthShared();
  const { hasPermission, role } = usePermissions();

  const [inactiveMembers, setInactiveMembers] = useState<InactiveMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resending, setResending] = useState<Record<string, boolean>>({});
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  type SortDirection = 'asc' | 'desc';
  interface Sort {
    field: string;
    direction: SortDirection;
  }

  const [sort, setSort] = useState<Sort[]>([{ field: 'createdAt', direction: 'desc' }]);
  const canViewInactive = role === 'ADMIN' || hasPermission('inactive-members-view');
  const canResend = role === 'ADMIN' || hasPermission('resend-invitation');

  const isFetchingRef = useRef(false); // 👈 prevent duplicate calls

  const buildQueryParams = () => {
    const sortParam = sort.map(s => `${s.field}:${s.direction}`).join(',');
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (sortParam) params.append('sort', sortParam);
    statusFilters.forEach((status) => params.append('status', status)); // Add status filters

    return params.toString();
  };

  const fetchInactiveMembers = useCallback(async () => {
    if (!canViewInactive || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setError('');
    setLoading(true);

    try {
      const token = await getAccessTokenSilently();
      const queryParams = buildQueryParams();

      const response = await fetch(`${backendUrl}/auth/inactive-members?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch inactive members');

      const data = await response.json();
      setInactiveMembers(data.invitations || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [page, pageSize, search, sort, statusFilters, canViewInactive, getAccessTokenSilently]);


  const handleResend = async (invitationId: string) => {
    setResending(prev => ({ ...prev, [invitationId]: true }));
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${backendUrl}/auth/resend-invitation/${invitationId}`,
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
    fetchInactiveMembers();
  }, [fetchInactiveMembers]);

  return {
    loading,
    error,
    members: inactiveMembers,
    totalCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    sort,
    setSort,
    resending,
    canViewInactive,
    canResend,
    handleResend,
    refetch: fetchInactiveMembers,
    statusFilters,
    setStatusFilters,
  };
}
