import type { Member, SortField } from '../types/types';

interface FetchMembersResponse {
  members: Member[];
  totalCount: number;
}

// Response cache with expiration
const responseCache = new Map<string, { data: FetchMembersResponse; timestamp: number }>();
const CACHE_EXPIRATION_MS = 30000; // 30 seconds

export async function fetchMembersFromApi(
  token: string,
  pageIndex: number,
  pageSize: number,
  searchQuery?: string,
  sortBy?: SortField,
  sortOrder?: 'asc' | 'desc',
  roles?: string[],
  signal?: AbortSignal
): Promise<FetchMembersResponse> {
  const cacheKey = JSON.stringify({
    pageIndex,
    pageSize,
    searchQuery,
    sortBy,
    sortOrder,
    roles: roles?.sort()
  });

  // Check cache (if not aborted and not expired)
  const cached = responseCache.get(cacheKey);
  if (cached && !signal?.aborted && (Date.now() - cached.timestamp) < CACHE_EXPIRATION_MS) {
    return cached.data;
  }

  const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/auth/members`);
  
  url.searchParams.append('page', pageIndex.toString());
  url.searchParams.append('pageSize', pageSize.toString());
  
  if (searchQuery) url.searchParams.append('search', searchQuery);
  if (sortBy) url.searchParams.append('sortBy', sortBy);
  if (sortOrder) url.searchParams.append('sortOrder', sortOrder);
  if (roles && roles.length > 0) {
    url.searchParams.append('roles', roles.join(','));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    signal,
    credentials: 'include' // Important for CORS with credentials
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch members');
  }

  const result = await response.json();
  responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return result;
}