import { PERMISSION_GROUPS } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PermissionEditProps {
  initialPermissions: Record<string, boolean>;
  onSave: (permissions: Record<string, boolean>) => void;
  onCancel: () => void;
  saving: boolean;
}

export function PermissionEdit({
  initialPermissions,
  onSave,
  onCancel,
  saving,
}: PermissionEditProps) {
  const [tempPermissions, setTempPermissions] = 
    useState<Record<string, boolean>>(initialPermissions);

  // Enforce dependency: permission-edit implies permission-view
  useEffect(() => {
    if (tempPermissions['permission-edit'] && !tempPermissions['permission-view']) {
      setTempPermissions(prev => ({
        ...prev,
        'permission-view': true
      }));
    }
  }, [tempPermissions]);

  const handleTogglePermission = (permissionValue: string, checked: boolean) => {
    setTempPermissions(prev => ({
      ...prev,
      [permissionValue]: checked
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Edit Permissions</h2>
      
      <div className="space-y-4">
        {PERMISSION_GROUPS.map(group => (
          <div key={group.id} className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">{group.label}</h3>
            <div className="space-y-2">
              {group.permissions.map(permission => {
                // Disable permission-view if permission-edit is enabled
                const isViewPermission = permission.value === 'permission-view';
                const isDisabled = isViewPermission && tempPermissions['permission-edit'];
                
                return (
                  <div key={permission.id} className="flex items-center">
                    <Checkbox
                      checked={tempPermissions[permission.value] || false}
                      onCheckedChange={(checked) => 
                        handleTogglePermission(permission.value, !!checked)
                      }
                      className="mr-2"
                      disabled={isDisabled}
                    />
                    <label>{permission.label}</label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={() => onSave(tempPermissions)} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}