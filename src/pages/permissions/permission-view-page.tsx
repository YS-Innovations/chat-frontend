import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams, useNavigate } from 'react-router-dom';
import { PermissionView } from './components/permission-view';
import { Button } from '@/components/ui/button';
import { PERMISSION_GROUPS } from './types'; 

export function PermissionViewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `http://localhost:3000/auth/permissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!response.ok) throw new Error('Failed to fetch permissions');
        
        const data = await response.json();
        
        // Convert array to permission object
        const permissionsObj = PERMISSION_GROUPS.reduce((acc: Record<string, boolean>, group) => {
          group.permissions.forEach(permission => {
            acc[permission.value] = data.permissions.includes(permission.value);
          });
          return acc;
        }, {});
        
        setPermissions(permissionsObj);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, getAccessTokenSilently]);

  if (loading) return <div className="text-center py-8">Loading permissions...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Permissions</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <PermissionView 
        selectedPermissions={permissions} 
        onEdit={() => navigate(`/permissions/edit/${userId}`)}
        canEdit={true}
      />
    </div>
  );
}