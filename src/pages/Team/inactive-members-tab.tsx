import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import type { InactiveMember } from './types';
import { usePermissions } from '@/context/permissions';

export function InactiveMembersTab() {
  const { getAccessTokenSilently } = useAuth0();
  const [inactiveMembers, setInactiveMembers] = useState<InactiveMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resending, setResending] = useState<Record<string, boolean>>({});
  const { hasPermission, role } = usePermissions();

  const fetchInactiveMembers = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/inactive-members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch inactive members');

      const data = await response.json();
      setInactiveMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveMembers();
  }, []);

  const handleResend = async (invitationId: string) => {
    setResending(prev => ({ ...prev, [invitationId]: true }));
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/resend-invitation/${invitationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend invitation');
      }

      // Refetch to update expiry dates
      fetchInactiveMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  // Check permissions
  const canViewInactive = role === 'ADMIN' || hasPermission('inactive-members-view');
  const canResend = role === 'ADMIN' || hasPermission('resend-invitation');

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

  if (inactiveMembers.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No inactive members found</p>
      </div>
    );
  }

  // Filter out the members that have accepted the invitation (i.e., `usedAt` is not null)
  const filteredMembers = inactiveMembers.filter(member => !member.usedAt);

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
        {filteredMembers.map((member) => (
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
                  <div className="text-sm text-muted-foreground">{member.invitedBy.email}</div>
                </div>
              ) : 'System'}
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
                  ) : 'Resend Email'}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
