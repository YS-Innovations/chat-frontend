import type { Member, SortField } from '../types/types';

interface FetchMembersResponse {
  members: Member[];
  totalCount: number;
}

export async function fetchMembersFromApi(
  token: string,
  pageIndex: number,
  pageSize: number,
  searchQuery?: string,
  sortBy?: SortField,
  sortOrder?: 'asc' | 'desc',
  roles?: string[]
): Promise<FetchMembersResponse> {
  const url = new URL(`http://localhost:3000/auth/members`);
  
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
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch members');
  }

  return await response.json();
}
