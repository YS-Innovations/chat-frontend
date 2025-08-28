import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { Link } from 'react-router-dom';

type ChannelType = 'WEB' | 'WHATSAPP';

interface Channel {
  id: string;
  uuid: string;
  channelToken: string;
  type: ChannelType;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

function daysLeftUntil(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const deleted = new Date(dateStr).getTime();
  const expires = deleted + 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const ms = Math.max(0, expires - now);
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

const ChannelRestorePage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeleted = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      // Reuse channels endpoint then filter; backend getChannelsByOrganization excludes deleted
      // so we hit channel-settings list then request individually not available; instead add a dedicated endpoint later
      // For now, try fetching all and filtering by presence of deletedAt if backend includes it when querying deleted only
      const res = await fetch(`${API_URL}/channels/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load channels');
      const data = await res.json();
      const deletedOnly = (data as Channel[]).filter((c: any) => c.isDeleted || c.deletedAt);
      setChannels(deletedOnly as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deleted channels');
      toast.error('Failed to load deleted channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/channels/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to restore channel');
      setChannels(prev => prev.filter(c => c.id !== id));
      toast.success('Channel restored');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to restore channel');
    }
  };

  const handlePurge = async (id: string) => {
    if (!confirm('This will permanently delete the channel and all related data. Continue?')) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/channels/${id}/purge`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to permanently delete channel');
      setChannels(prev => prev.filter(c => c.id !== id));
      toast.success('Channel permanently deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to permanently delete channel');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-destructive text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Channel Restore</h1>
        <Link to="/app/channel-settings">
          <Button variant="outline">Back to Channels</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deleted Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deleted channels.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Auto-Delete In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c: any) => {
                  const deletedAt = c.deletedAt ? new Date(c.deletedAt) : null;
                  const expiresAt = deletedAt ? new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
                  const daysLeft = daysLeftUntil(c.deletedAt || null);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.channelSettings?.name || 'Unnamed'}</TableCell>
                      <TableCell className="font-mono text-sm">{c.channelToken}</TableCell>
                      <TableCell>{deletedAt ? deletedAt.toLocaleString() : '-'}</TableCell>
                      <TableCell>{expiresAt ? expiresAt.toLocaleString() : '-'}</TableCell>
                      <TableCell>{daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? '' : 's'}` : '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleRestore(c.id)}>Restore</Button>
                        <Button variant="destructive" size="sm" onClick={() => handlePurge(c.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelRestorePage;


