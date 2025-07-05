import { PERMISSION_GROUPS } from "./types";

// Convert permission array to object
export const arrayToPermissionObject = (permissionsArray: string[]): Record<string, boolean> => {
  return PERMISSION_GROUPS.reduce((acc: Record<string, boolean>, group) => {
    group.permissions.forEach(permission => {
      acc[permission.value] = permissionsArray.includes(permission.value);
    });
    return acc;
  }, {});
};

// Convert permission object to array
export const permissionObjectToArray = (permissionsObj: Record<string, boolean>): string[] => {
  return Object.entries(permissionsObj)
    .filter(([_, value]) => value)
    .map(([key]) => key);
};