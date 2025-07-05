import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { arrayToPermissionObject } from "../utils";

export function usePermissionViewPage(userId?: string) {
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
        setPermissions(arrayToPermissionObject(data.permissions));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPermissions();
  }, [userId, getAccessTokenSilently]);

  return {
    permissions,
    loading,
    error
  };
}