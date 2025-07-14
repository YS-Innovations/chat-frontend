import { useState, useMemo } from "react";
import { PERMISSION_GROUPS, type PermissionEditProps } from "../types/types";

export function usePermissionEdit(props: PermissionEditProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return PERMISSION_GROUPS;

    const term = searchTerm.toLowerCase();
    return PERMISSION_GROUPS.map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (p) =>
          p.label.toLowerCase().includes(term) ||
          p.value.toLowerCase().includes(term)
      ),
    })).filter((group) => group.permissions.length > 0);
  }, [searchTerm]);

  const handleTogglePermission = (
    permissionValue: string,
    checked: boolean
  ) => {
    const newPermissions = { ...props.value, [permissionValue]: checked };

    if (permissionValue === "permission-edit" && checked) {
      newPermissions["permission-view"] = true;
    }

    props.onChange(newPermissions);
    setIsDirty(true);
  };

  const handleGroupToggle = (permissions: string[]) => {
    const allChecked = permissions.every((perm) => props.value[perm]);
    const newPermissions = { ...props.value };

    permissions.forEach((perm) => {
      newPermissions[perm] = !allChecked;
    });

    props.onChange(newPermissions);
    setIsDirty(true);
  };

  const handleSelectAll = () => {
    const newPermissions = { ...props.value };

    PERMISSION_GROUPS.forEach((group) => {
      group.permissions.forEach((permission) => {
        newPermissions[permission.value] = true;
      });
    });

    props.onChange(newPermissions);
    setIsDirty(true);
  };

  const handleClearAll = () => {
    const newPermissions = { ...props.value };

    PERMISSION_GROUPS.forEach((group) => {
      group.permissions.forEach((permission) => {
        newPermissions[permission.value] = false;
      });
    });

    props.onChange(newPermissions);
    setIsDirty(true);
  };

  return {
    isDirty,
    expandedGroups,
    filteredGroups,
    handleTogglePermission,
    handleGroupToggle,
    handleSelectAll,
    handleClearAll,
    setSearchTerm,
    setExpandedGroups,
  };
}