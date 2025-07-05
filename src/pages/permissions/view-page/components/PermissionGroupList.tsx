import type { PermissionGroup } from "@/pages/permissions/types";

interface PermissionGroupListProps {
  filteredGroups: PermissionGroup[];
  selectedPermissions: Record<string, boolean>;
}

export function PermissionGroupList({ filteredGroups, selectedPermissions }: PermissionGroupListProps) {
  return (
    <div className="permission-groups">
      {filteredGroups.map(group => (
        <div key={group.id} className="permission-group">
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
  );
}
