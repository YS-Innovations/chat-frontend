import { useState, useMemo } from "react";
import { PERMISSION_GROUPS, type PermissionGroup } from "@/pages/permissions/types/types";
import type { PermissionViewProps } from "../types/types";

export function usePermissionView({ 
  selectedPermissions 
}: Pick<PermissionViewProps, "selectedPermissions">) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredGroups: PermissionGroup[] = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    
    return PERMISSION_GROUPS
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(p => 
          selectedPermissions[p.value] && 
          (term === '' || 
           p.label.toLowerCase().includes(term) || 
           p.value.toLowerCase().includes(term))
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