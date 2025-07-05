import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PermissionViewProps } from "../types/types";
import type { PermissionGroup } from "@/pages/permissions/types";
import { usePermissionView } from "../hooks/usePermissionView";

export function PermissionView({ 
  selectedPermissions, 
  onEdit, 
  canEdit 
}: PermissionViewProps) {
  const { searchTerm, filteredGroups, setSearchTerm } = usePermissionView({
    selectedPermissions
  });

  return (
    <div className="permission-view">
      <div className="controls">
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {canEdit && (
          <Button onClick={onEdit} className="edit-button">
            Edit Permissions
          </Button>
        )}
      </div>
      
      <div className="permission-groups">
        {filteredGroups.map((group: PermissionGroup) => (
          <div key={group.id} className="permission-group">
            {/* Fixed: Changed groupName to label */}
            <h2>{group.label}</h2>
            <div className="permissions-list">
              {group.permissions.map(permission => (
                <div key={permission.value} className="permission-item">
                  <input 
                    type="checkbox"
                    checked={selectedPermissions[permission.value]}
                    readOnly
                    className="permission-checkbox"
                  />
                  <label>{permission.label}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}