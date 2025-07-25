import { useInactiveMembers } from '../hooks/useInactiveMembers';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyState } from '@/components/data-table/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { SearchInput } from '@/components/search-input';
import { useEffect, useState } from 'react';
import type { Column, ColumnDef, SortingState, Table } from '@tanstack/react-table';
import type { InactiveMember } from '../types/types';
// import { toast } from 'sonner'; // Optional for notification

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
    setSort,
    resending,
    canViewInactive,
    canResend,
    handleResend,
    statusFilters,
    setStatusFilters,
  } = useInactiveMembers();

  const [sortingState, setSortingState] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  useEffect(() => {
    const mappedSort = sortingState.map((s) => ({
      field: s.id,
      direction: s.desc ? 'desc' as const : 'asc' as const,
    }));
    setSort(mappedSort);
    setPage(0);
  }, [sortingState]);

  const getSortableHeader = (
    label: string,
    column: Column<InactiveMember>,
    table: Table<InactiveMember>
  ) => {
    const sorting = table.getState().sorting;
    const sortIndex = sorting.findIndex((s: { id: string }) => s.id === column.id);
    const isSorted = sortIndex > -1;
    const sortDirection = isSorted ? (sorting[sortIndex].desc ? 'desc' : 'asc') : null;

    return (
      <div
        className="flex items-center space-x-1 cursor-pointer select-none"
        onClick={column.getToggleSortingHandler()}
      >
        <span>{label}</span>
        {isSorted && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            {sortDirection === 'asc' ? '▲' : '▼'}
            {sorting.length > 1 && (
              <span className="text-[10px]">{sortIndex + 1}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const columns: ColumnDef<InactiveMember>[] = [
    {
      accessorKey: 'email',
      header: ({ column, table }) =>
        getSortableHeader('User', column, table),
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
      accessorKey: 'invitedBy.name', // Backend must support nested sorting
      header: ({ column, table }) =>
        getSortableHeader('Invited By', column, table),
      cell: ({ row }) =>
        row.original.invitedBy ? (
          <div>
            <div>{row.original.invitedBy.name || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.invitedBy.email}
            </div>
          </div>
        ) : (
          'System'
        ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column, table }) =>
        getSortableHeader('Created Date', column, table),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expiry Date',
      cell: ({ row }) => (
        <div className="flex items-center">
          {new Date(row.original.expiresAt).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="outline"
            className={
              status === 'Pending'
                ? 'text-blue-600 border-blue-600'
                : 'text-red-600 border-red-600'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        row.original.status === 'Expired' && canResend ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleResend(row.original.id);
              // toast.success(`Resent invite to ${row.original.email}`);
            }}
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
        You don't have permission to view inactive members.
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
      <div className="flex items-center gap-2 text-sm">
        <label>
          <input
            type="checkbox"
            className="mr-1"
            checked={statusFilters.includes('Pending')}
            onChange={(e) => {
              const checked = e.target.checked;
              setPage(0);
              setStatusFilters((prev) =>
                checked
                  ? [...prev, 'Pending']
                  : prev.filter((f) => f !== 'Pending')
              );
            }}
          />
          Pending
        </label>
        <label>
          <input
            type="checkbox"
            className="mr-1"
            checked={statusFilters.includes('Expired')}
            onChange={(e) => {
              const checked = e.target.checked;
              setPage(0);
              setStatusFilters((prev) =>
                checked
                  ? [...prev, 'Expired']
                  : prev.filter((f) => f !== 'Expired')
              );
            }}
          />
          Expired
        </label>
      </div>
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
              setSortingState([{ id: 'createdAt', desc: true }]);
              setPage(0);
            }}
          />
        }
      />
    </div>
  );
}
