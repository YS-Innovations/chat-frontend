export interface PermissionsContextType {
  permissions: Record<string, boolean>;
  role: 'ADMIN' | 'AGENT' | 'COADMIN' | null;
  isLoading: boolean;
  refreshPermissions: () => void;
  hasPermission: (key: string) => boolean;
}
