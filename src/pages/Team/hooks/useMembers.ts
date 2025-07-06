// src/pages/Team/hooks/useMembers.ts

import { usePagination } from './usePagination';
import { useMemberFetcher } from './useMemberFetcher';

export function useMembers() {
  const { pageIndex, setPageIndex, pageSize, setPageSize } = usePagination();
  const {
    members,
    totalCount,
    error,
    loading,
    fetchMembers,
  } = useMemberFetcher(pageIndex, pageSize);

  return {
    members,
    totalCount,
    error,
    loading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    fetchMembers,
  };
}
