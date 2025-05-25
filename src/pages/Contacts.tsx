// src/pages/Contacts.tsx
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

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

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/members', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      await fetchMembers(); // Refresh the list
    } catch (err) {
      console.error('Failed to invite user:', err);
      setError('Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Organization Members</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to invite"
          style={{ padding: '8px', flex: 1 }}
        />
        <button 
          onClick={handleInvite}
          disabled={loading}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
        >
          {loading ? 'Inviting...' : 'Invite'}
        </button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{member.name || 'N/A'}</td>
              <td style={{ padding: '10px' }}>{member.email}</td>
              <td style={{ padding: '10px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  backgroundColor: member.role === 'ADMIN' ? '#ff9800' : '#2196F3',
                  color: 'white'
                }}>
                  {member.role}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
                {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : 'Never'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Contacts;