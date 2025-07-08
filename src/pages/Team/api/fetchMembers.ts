import type { Member } from '../types/types';

interface FetchMembersResponse {
  members: Member[];
  totalCount: number;
}

export async function fetchMembersFromApi(
  token: string,
  pageIndex: number,
  pageSize: number,
  searchQuery?: string
): Promise<FetchMembersResponse> {
  const url = new URL(`http://localhost:3000/auth/members`);
  url.searchParams.append('page', pageIndex.toString());
  url.searchParams.append('pageSize', pageSize.toString());
  if (searchQuery) {
    url.searchParams.append('search', searchQuery);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }

  return await response.json();
}

