import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useInactiveMembers } from '../hooks/useInactiveMembers';

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

  if (!canViewInactive) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        You don't have permission to view inactive members
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (members.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No inactive members found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Invited By</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {getInitials(member.email)}
                  </AvatarFallback>
                </Avatar>
                <span>{member.email}</span>
              </div>
            </TableCell>
            <TableCell>
              {member.invitedBy ? (
                <div>
                  <div>{member.invitedBy.name || 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.invitedBy.email}
                  </div>
                </div>
              ) : (
                'System'
              )}
            </TableCell>
            <TableCell>
              {new Date(member.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                {new Date(member.expiresAt).toLocaleString()}
                {member.status === 'Pending' && (
                  <span className="ml-2 text-xs text-blue-500">(Pending)</span>
                )}
                {member.status === 'Expired' && (
                  <span className="ml-2 text-xs text-red-500">(Expired)</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {member.status === 'Expired' && canResend && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResend(member.id)}
                  disabled={resending[member.id]}
                >
                  {resending[member.id] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Resend Email'
                  )}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}