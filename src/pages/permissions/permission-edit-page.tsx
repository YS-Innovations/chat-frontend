import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams } from 'react-router-dom';
import { PermissionEdit } from './components/permission-edit';
import { Button } from '@/components/ui/button';
import type { Role } from '../contacts/types';

export function PermissionEditPage() {
  const { userId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [targetUserRole, setTargetUserRole] = useState<Role | null>(null);
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = await getAccessTokenSilently();

        // Fetch target user info
        const userResponse = await fetch(
          `http://localhost:3000/auth/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();
        setTargetUserRole(userData.role);

        // Prevent editing permissions for admin users
        if (userData.role === 'ADMIN') {
          setError('Cannot edit permissions for admin users');
          setLoading(false);
          return;
        }

        // Fetch permissions
        const permResponse = await fetch(
          `http://localhost:3000/auth/permissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!permResponse.ok) throw new Error('Failed to fetch permissions');
        const permData = await permResponse.json();
        setPermissions(permData.permissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, getAccessTokenSilently]);

  const handleSave = async (updatedPermissions: Record<string, boolean>) => {
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:3000/auth/permissions/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions: updatedPermissions }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save permissions');
      }
      setPermissions(updatedPermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Permissions</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>
      <PermissionEdit
        initialPermissions={permissions}
        onSave={handleSave}
        onCancel={() => window.history.back()}
        saving={saving}
      />
    </div>
  );
}