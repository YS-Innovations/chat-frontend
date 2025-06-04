// Contacts.tsx
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'AGENT';
  lastLogin: Date | null;
}

function Contacts() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      
      const response = await fetch('http://localhost:3000/auth/members', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const membersData = await response.json();
      setMembers(membersData);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to fetch organization members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setInviteStatus('');
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmail('');
        setInviteStatus('Invitation sent successfully');
        fetchMembers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {inviteStatus && (
            <Alert className="mb-4">
              <AlertDescription>{inviteStatus}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mb-6">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to invite"
            />
            <Button
              onClick={handleInvite}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inviting...
                </>
              ) : 'Invite'}
            </Button>
          </div>

          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name || 'N/A'}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={member.role === 'ADMIN' ? 'destructive' : 'default'}
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.lastLogin 
                        ? new Date(member.lastLogin).toLocaleString() 
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Contacts;