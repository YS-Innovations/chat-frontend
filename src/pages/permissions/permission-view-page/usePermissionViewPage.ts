import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useParams } from 'react-router-dom';
import { arrayToPermissionObject } from "../utils";

export function usePermissionViewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleEdit = () => navigate(`/permissions/edit/${userId}`);
  const handleBack = () => navigate(-1);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (!userId) return;
        
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `http://localhost:3000/auth/permissions/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!response.ok) throw new Error('Failed to fetch permissions');
        
        const { permissions } = await response.json();
        setPermissions(arrayToPermissionObject(permissions));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, getAccessTokenSilently]);

  return {
    userId,
    navigate,
    permissions,
    loading,
    error,
    handleEdit,
    handleBack
  };
}