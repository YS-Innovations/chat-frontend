import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams } from 'react-router-dom';
import { PermissionView } from './components/permission-view';
import { Button } from '@/components/ui/button';

export function PermissionViewPage() {
  const { userId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `http://localhost:3000/auth/permissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!response.ok) throw new Error('Failed to fetch permissions');
        
        const data = await response.json();
        setPermissions(data.permissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, getAccessTokenSilently]);

  if (loading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Permissions</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>
      <PermissionView selectedPermissions={permissions} />
    </div>
  );
}