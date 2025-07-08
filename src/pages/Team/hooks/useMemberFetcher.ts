import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import type { Member } from '../types/types';
import { fetchMembersFromApi } from '../api/fetchMembers';
import type { SortingState } from "@tanstack/react-table";
export function useMemberFetcher(
  pageIndex: number,
  pageSize: number,
  searchQuery = '',
  sorting: SortingState = []
) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      // Convert sorting state to API parameters
      let sortBy, sortOrder;
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? 'desc' : 'asc' as 'desc' | 'asc';

      }

      const { members: membersData, totalCount } = await fetchMembersFromApi(
        token,
        pageIndex,
        pageSize,
        searchQuery,
        sortBy,
        sortOrder
      );
      
      setMembers(membersData);
      setTotalCount(totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, [user, getAccessTokenSilently, pageIndex, pageSize, searchQuery, sorting]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    totalCount,
    error,
    loading,
    fetchMembers,
  };
}