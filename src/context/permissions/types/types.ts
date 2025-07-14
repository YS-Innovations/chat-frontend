export interface PermissionsContextType {
  permissions: Record<string, boolean>;
  role: 'ADMIN' | 'AGENT' |'OWNER'| 'GUEST' | null ;
  isLoading: boolean;
  refreshPermissions: () => void;
  hasPermission: (key: string) => boolean;
}
