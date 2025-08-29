import React, { useEffect, useState } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { PermissionsContext } from './PermissionsContext';
import { type PermissionsContextType } from './types/types';

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuthShared();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<'OWNER' | 'AGENT' | 'ADMIN' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/my-permissions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch permissions');

      const data = await response.json();
      setPermissions(data.permissions || {});
      setRole(data.role);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPermissions();
      const interval = setInterval(fetchPermissions, 300000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const hasPermission = (key: string) => {
    if (role === 'OWNER') return true;
    return permissions[key] === true;
  };

  const value: PermissionsContextType = {
    permissions,
    role,
    isLoading,
    refreshPermissions: fetchPermissions,
    hasPermission,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
