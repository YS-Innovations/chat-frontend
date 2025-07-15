import { useInactiveMembers } from '../hooks/useInactiveMembers';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyState } from '@/components/data-table/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { SearchInput } from '@/components/search-input';
import { useMemo, useEffect, useState } from 'react';
import type { InactiveMember } from '../types/types';

export function Invitepending() {
  const {
    loading,
    error,
    members,
    totalCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    sort,
    setSort,
    resending,
    canViewInactive,
    canResend,
    handleResend,
  } = useInactiveMembers();

  const [sortingState, setSortingState] = useState<SortingState>([]);

  // Sync tanstack sort to our internal sort format
  useEffect(() => {
    const mappedSort = sortingState.map(s => ({
      field: s.id,
      direction: s.desc ? 'desc' as const : 'asc' as const,
    }));
    setSort(mappedSort);
    setPage(0);
  }, [sortingState]);

  const columns: ColumnDef<InactiveMember>[] = [
    {
      accessorKey: 'email',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>{getInitials(row.original.email)}</AvatarFallback>
          </Avatar>
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'invitedBy',
      header: 'Invited By',
      cell: ({ row }) =>
        row.original.invitedBy ? (
          <div>
            <div>{row.original.invitedBy.name || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">{row.original.invitedBy.email}</div>
          </div>
        ) : (
          'System'
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expiry Date',
      cell: ({ row }) => (
        <div className="flex items-center">
          {new Date(row.original.expiresAt).toLocaleString()}
          {row.original.status === 'Pending' && (
            <span className="ml-2 text-xs text-blue-500">(Pending)</span>
          )}
          {row.original.status === 'Expired' && (
            <span className="ml-2 text-xs text-red-500">(Expired)</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        row.original.status === 'Expired' && canResend ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResend(row.original.id)}
            disabled={resending[row.original.id]}
          >
            {resending[row.original.id] ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Resend Email'
            )}
          </Button>
        ) : null,
    },
  ];

  if (!canViewInactive) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        You don't have permission to view inactive members
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <SearchInput
        value={search}
        onChange={(val) => {
          setPage(0);
          setSearch(val);
        }}
        placeholder="Search pending invites..."
      />

      <DataTable<InactiveMember>
        columns={columns}
        data={members}
        totalCount={totalCount}
        loading={loading}
        error={error}
        pageIndex={page}
        pageSize={pageSize}
        setPageIndex={setPage}
        setPageSize={setPageSize}
        sorting={sortingState}
        setSorting={setSortingState}
        enableRowSelection={false}
        emptyState={
          <EmptyState
            hasSearch={!!search}
            hasFilters={false}
            onClearFilters={() => {
              setSearch('');
              setSort([{ field: 'createdAt', direction: 'desc' }]);
              setSortingState([]);
              setPage(0);
            }}
          />
        }
      />
    </div>
  );
}
