import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface PermissionsContextType {
  permissions: Record<string, boolean>;
  role: 'ADMIN' | 'AGENT' | 'COADMIN' |null;
  isLoading: boolean;
  refreshPermissions: () => void;
  hasPermission: (key: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: {},
  role: null,
  isLoading: true,
  refreshPermissions: () => {},
  hasPermission: () => false,
});

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<'ADMIN' | 'AGENT' | 'COADMIN'|null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:3000/auth/my-permissions', {
        headers: { Authorization: `Bearer ${token}` }
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
    if (role === 'ADMIN') return true;
    return permissions[key] === true;
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        role,
        isLoading,
        refreshPermissions: fetchPermissions,
        hasPermission,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);