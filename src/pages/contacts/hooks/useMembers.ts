import { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import type { Member } from '../types';

export function useMembers() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMembers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const response = await fetch(
        `http://localhost:3000/auth/members?page=${pageIndex}&pageSize=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch members');
      
      const { members: membersData, totalCount } = await response.json();
      setMembers(membersData);
      setTotalCount(totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user, pageIndex, pageSize, getAccessTokenSilently]);

  return {
    members,
    totalCount,
    error,
    loading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    fetchMembers // Add refetch capability
  };
}