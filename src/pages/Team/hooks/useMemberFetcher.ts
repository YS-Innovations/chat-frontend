import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import type { Member, SortingState, SortField } from '../types/types';
import { fetchMembersFromApi } from '../api/fetchMembers';

export function useMemberFetcher(
  pageIndex: number,
  pageSize: number,
  searchQuery = '',
  sorting: SortingState = [],
  roles?: string[]
) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortLoading, setSortLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!user) return;

    const isSorting = sorting.length > 0;
    if (isSorting) setSortLoading(true);
    else setLoading(true);

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      let sortBy: SortField | undefined;
      let sortOrder: 'asc' | 'desc' | undefined;
      
      if (sorting.length > 0) {
        sortBy = sorting[0].id as SortField;
        sortOrder = sorting[0].desc ? 'desc' : 'asc';
      }

      const { members: membersData, totalCount } = await fetchMembersFromApi(
        token,
        pageIndex,
        pageSize,
        searchQuery,
        sortBy,
        sortOrder,
        roles
      );
      
      setMembers(membersData);
      setTotalCount(totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      if (isSorting) setSortLoading(false);
      else setLoading(false);
    }
  }, [user, getAccessTokenSilently, pageIndex, pageSize, searchQuery, sorting, roles]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    totalCount,
    error,
    loading,
    sortLoading,
    fetchMembers,
  };
}