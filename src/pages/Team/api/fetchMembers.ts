import type { Member } from '../types/types';

interface FetchMembersResponse {
  members: Member[];
  totalCount: number;
}

export async function fetchMembersFromApi(
  token: string,
  pageIndex: number,
  pageSize: number
): Promise<FetchMembersResponse> {
  const response = await fetch(
    `http://localhost:3000/auth/members?page=${pageIndex}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }

  return await response.json();
}
