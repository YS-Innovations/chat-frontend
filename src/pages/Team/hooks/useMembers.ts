import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePagination } from './usePagination';
import { useMemberFetcher } from './useMemberFetcher';
import type { SortingState, ColumnSort } from "@tanstack/react-table";
import type { SortField } from '../types/types';

export function useMembers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pageIndex, setPageIndex, pageSize, setPageSize } = usePagination();
  
  // Get initial state from URL
  const initialSearch = searchParams.get('search') || '';
  const initialRoles = searchParams.get('roles')?.split(',')?.filter(Boolean) || [];
  const initialSort = searchParams.get('sort')?.split(':') || [];
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sorting, setSorting] = useState<SortingState>(
    initialSort[0] ? [{ 
      id: initialSort[0] as SortField, 
      desc: initialSort[1] === 'desc' 
    }] : []
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', pageIndex.toString());
    params.set('pageSize', pageSize.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (selectedRoles.length) params.set('roles', selectedRoles.join(','));
    if (sorting.length) {
      const sort = sorting[0] as ColumnSort & { id: SortField };
      params.set('sort', `${sort.id}:${sort.desc ? 'desc' : 'asc'}`);
    }
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedRoles, sorting, pageIndex, pageSize]);

  const { members, totalCount, error, loading, fetchMembers } = useMemberFetcher(
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