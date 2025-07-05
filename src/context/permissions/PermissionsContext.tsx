import { createContext } from 'react';
import { type PermissionsContextType } from './types/types';

export const PermissionsContext = createContext<PermissionsContextType>({
  permissions: {},
  role: null,
  isLoading: true,
  refreshPermissions: () => {},
  hasPermission: () => false,
});
