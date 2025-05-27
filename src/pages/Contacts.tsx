import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'AGENT';
  lastLogin: Date | null;
}

export default function Contacts() {
  const { getAccessTokenSilently } = useAuth0();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError('Failed to load organization members');
    }
  };

  const handleInvite = async () => {
    if (!email) return;
    
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      await fetch('http://localhost:3000/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      
      setEmail('');
      await fetchMembers();
    } catch (err) {
      console.error('Failed to invite user:', err);
      setError('Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          <div className="flex gap-2 mb-6">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to invite"
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={loading}>
              {loading ? 'Inviting...' : 'Invite'}
            </Button>
          </div>
          
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
                    <span className={`px-2 py-1 rounded ${
                      member.role === 'ADMIN' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}