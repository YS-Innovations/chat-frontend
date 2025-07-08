// src/pages/Team/hooks/useMembers.ts

import { useState } from 'react';
import { usePagination } from './usePagination';
import { useMemberFetcher } from './useMemberFetcher';

export function useMembers() {
  const { pageIndex, setPageIndex, pageSize, setPageSize } = usePagination();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    members,
    totalCount,
    error,
    loading,
    fetchMembers,
  } = useMemberFetcher(pageIndex, pageSize, searchQuery);

  return {
    members,
    totalCount,
    error,
    loading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    fetchMembers,
  };
}
