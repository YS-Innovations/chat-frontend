import { useInactiveMembers } from '../hooks/useInactiveMembers';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyState } from '@/components/data-table/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { InactiveMember } from '../types/types';

export function Invitepending() {
  const {
    loading,
    error,
    members,
    resending,
    canViewInactive,
    canResend,
    handleResend,
  } = useInactiveMembers();

  const columns: ColumnDef<InactiveMember>[] = [
    {
      accessorKey: 'email',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {getInitials(row.original.email)}
            </AvatarFallback>
          </Avatar>
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'invitedBy',
      header: 'Invited By',
      cell: ({ row }) => (
        row.original.invitedBy ? (
          <div>
            <div>{row.original.invitedBy.name || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.invitedBy.email}
            </div>
          </div>
        ) : (
          'System'
        )
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
      cell: ({ row }) => (
        row.original.status === 'Expired' && canResend && (
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
        )
      ),
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
    <DataTable<InactiveMember>
      columns={columns}
      data={members}
      totalCount={members.length}
      loading={loading}
      error={error}
      pageIndex={0}
      pageSize={members.length}
      setPageIndex={() => {}}
      setPageSize={() => {}}
      sorting={[]}
      setSorting={() => {}}
      enableRowSelection={false}
      emptyState={
        <EmptyState
          hasSearch={false}
          hasFilters={false}
          onClearFilters={() => {}}
        />
      }
    />
  );
}