export interface PermissionsContextType {
  permissions: Record<string, boolean>;
  role: 'ADMIN' | 'AGENT' | 'COADMIN' |'OWNER'|'GUEST' | null ;
  isLoading: boolean;
  refreshPermissions: () => void;
  hasPermission: (key: string) => boolean;
}
