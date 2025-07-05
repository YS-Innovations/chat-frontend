import { PERMISSION_GROUPS, type PermissionViewProps } from "@/pages/permissions/types";
import { useState, useMemo } from "react";

export function usePermissionView({ selectedPermissions }: Pick<PermissionViewProps, "selectedPermissions">) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return PERMISSION_GROUPS;
    
    const term = searchTerm.toLowerCase();
    return PERMISSION_GROUPS
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(
          p => (p.label.toLowerCase().includes(term) || 
                p.value.toLowerCase().includes(term)) && 
                selectedPermissions[p.value]
        )
      }))
      .filter(group => group.permissions.length > 0);
  }, [searchTerm, selectedPermissions]);

  return {
    searchTerm,
    filteredGroups,
    setSearchTerm
  };
}