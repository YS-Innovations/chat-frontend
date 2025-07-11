import type { PermissionViewProps } from "../types/types";
import { usePermissionView } from "../hooks/useFilteredPermissions";
import { PermissionControls } from "./PermissionControls";
import { PermissionGroupList } from "./PermissionGroupList";

export function PermissionView({ selectedPermissions, onEdit, canEdit }: PermissionViewProps) {
  const { searchTerm, filteredGroups, setSearchTerm } = usePermissionView({ selectedPermissions });

  return (
    <div className="permission-view">
      <PermissionControls 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        canEdit={canEdit}
        onEdit={onEdit}
      />
      <PermissionGroupList 
        filteredGroups={filteredGroups}
        selectedPermissions={selectedPermissions}
      />
    </div>
  );
}
