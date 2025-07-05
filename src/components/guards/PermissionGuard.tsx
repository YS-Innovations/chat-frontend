import { type ReactNode } from 'react';
import { usePermissions } from '@/context/permissions';
import { Navigate, useLocation } from 'react-router-dom';

export const PermissionGuard = ({
  children,
  permission,
}: {
  children: ReactNode;
  permission: string;
}) => {
  const { hasPermission, isLoading } = usePermissions();
  const location = useLocation();

  if (isLoading) return <div>Loading permissions...</div>;
  
  if (!hasPermission(permission)) {
    return <Navigate to="/app" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};