import { useState } from 'react';
import { usePagination } from './usePagination';
import { useMemberFetcher } from './useMemberFetcher';
import type { SortingState } from "@tanstack/react-table";

export function useMembers() {
  const { pageIndex, setPageIndex, pageSize, setPageSize } = usePagination();
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    members,
    totalCount,
    error,
    loading,
    fetchMembers,
  } = useMemberFetcher(pageIndex, pageSize, searchQuery, sorting);

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
    sorting,
    setSorting,
    fetchMembers,
  };
}