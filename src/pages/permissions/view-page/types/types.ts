
export type PermissionViewProps = {
  selectedPermissions: Record<string, boolean>;
  onEdit: () => void;
  canEdit: boolean;
};