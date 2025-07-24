import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Member, SortingState, SortField } from '../types/types';
import { fetchMembersFromApi } from '../api/fetchMembers';

const requestQueue = new Map<string, Promise<{ members: Member[]; totalCount: number }>>();

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

  // Ref to hold current AbortController to cancel ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate a stable key to identify requests with the same params
  const requestSignature = useMemo(() => {
    return JSON.stringify({
      pageIndex,
      pageSize,
      searchQuery,
      sorting: sorting.map(s => ({ id: s.id, desc: s.desc })),
      roles: roles?.slice().sort(), // sort to keep order consistent
    });
  }, [pageIndex, pageSize, searchQuery, sorting, roles]);

  const fetchMembers = useCallback(async () => {
    if (!user) return;

    // If a request with the same signature is already in progress, wait for it
    const existingRequest = requestQueue.get(requestSignature);
    if (existingRequest) {
      try {
        const result = await existingRequest;
        setMembers(result.members);
        setTotalCount(result.totalCount);
        setError(null);
      } catch (err) {
        // error handled below
      }
      return;
    }

    const isSorting = sorting.length > 0;
    if (isSorting) setSortLoading(true);
    else setLoading(true);

    // Cancel any ongoing fetch request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchPromise = (async () => {
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

        const result = await fetchMembersFromApi(
          token,
          pageIndex,
          pageSize,
          searchQuery,
          sortBy,
          sortOrder,
          roles,
          abortController.signal
        );

        setMembers(result.members);
        setTotalCount(result.totalCount);
        setError(null);

        return result;
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError(err instanceof Error ? err.message : 'Failed to fetch members');
        }
        throw err;
      } finally {
        requestQueue.delete(requestSignature);
        abortControllerRef.current = null;
        if (isSorting) setSortLoading(false);
        else setLoading(false);
      }
    })();

    requestQueue.set(requestSignature, fetchPromise);

    return fetchPromise;
  }, [user, getAccessTokenSilently, requestSignature, pageIndex, pageSize, searchQuery, sorting, roles]);

  useEffect(() => {
    fetchMembers();

    // Cleanup on unmount or when requestSignature changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      requestQueue.delete(requestSignature);
    };
  }, [fetchMembers, requestSignature]);

  return { members, totalCount, error, loading, sortLoading, fetchMembers };
}
