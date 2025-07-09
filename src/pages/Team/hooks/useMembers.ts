import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePagination } from './usePagination';
import { useMemberFetcher } from './useMemberFetcher';
import type { SortingState } from '@tanstack/react-table';
import type { SortField } from '../types/types';

export function useMembers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pageIndex, setPageIndex, pageSize, setPageSize } = usePagination();

  // Get initial state from URL
  const initialSearch = searchParams.get('search') || '';
  const initialRoles = searchParams.get('roles')?.split(',').filter(Boolean) || [];
  const initialSort = searchParams.get('sort') || '';

  // Parse initial sorting: "field:asc" or "field:desc"
  const initialSorting: SortingState = initialSort
    ? (() => {
        const [field, direction] = initialSort.split(':');
        return [
          {
            id: field as SortField,
            desc: direction === 'desc',
          },
        ];
      })()
    : [];

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageIndex.toString());
    params.set('pageSize', pageSize.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (selectedRoles.length) params.set('roles', selectedRoles.join(','));
    if (sorting.length) {
      const sort = sorting[0];
      params.set('sort', `${sort.id}:${sort.desc ? 'desc' : 'asc'}`);
    }
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedRoles, sorting, pageIndex, pageSize, setSearchParams]);

  const {
    members,
    totalCount,
    error,
    loading,
    sortLoading,
    fetchMembers,
  } = useMemberFetcher(
    pageIndex,
    pageSize,
    searchQuery,
    sorting as { id: SortField; desc: boolean }[],
    selectedRoles
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedRoles([]);
    setSorting([]);
    setPageIndex(0);
  };

  return {
    members,
    totalCount,
    error,
    loading,
    sortLoading,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    sorting,
    setSorting,
    selectedRoles,
    setSelectedRoles,
    clearAllFilters,
    fetchMembers,
  };
}
