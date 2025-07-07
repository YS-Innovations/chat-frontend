import type { Member } from "../types";

export function usePermissionsLogic(
  role: string,
  member: Member,
  hasPermission: (perm: string) => boolean
) {
  const canDelete = role === 'ADMIN' ||
    (hasPermission('user-delete') && member.role === 'AGENT');

  const canViewPermissions = role === 'ADMIN' || hasPermission('permission-view');

  const canEditPermissions =
    (role === 'ADMIN' && member.role !== 'ADMIN') ||
    (role === 'COADMIN' && member.role !== 'COADMIN' && hasPermission('permission-edit')) ||
    (role === 'ADMIN' && hasPermission('permission-edit'));

  return { canDelete, canViewPermissions, canEditPermissions };
}
