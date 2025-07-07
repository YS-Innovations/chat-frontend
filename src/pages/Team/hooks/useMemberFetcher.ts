// src/pages/Team/hooks/useMemberFetcher.ts

import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import type { Member } from '../types/types';
import { fetchMembersFromApi } from '../api/fetchMembers';

export function useMemberFetcher(pageIndex: number, pageSize: number) {
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

      const { members: membersData, totalCount } = await fetchMembersFromApi(token, pageIndex, pageSize);
      setMembers(membersData);
      setTotalCount(totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, [user, getAccessTokenSilently, pageIndex, pageSize]);

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
