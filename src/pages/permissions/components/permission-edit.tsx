// src/pages/permissions/components/permission-edit.tsx
import { Button } from "@/components/ui/button";
import { PERMISSION_GROUPS } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface PermissionEditProps {
  value: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  onSaveClick: () => void;
  onCancel: () => void;
  saving: boolean;
  templates: any[];
  onTemplateClick: (templateId: string) => void;
}

export function PermissionEdit({
  value,
  onChange,
  onSaveClick,
  onCancel,
  saving,
  templates,
  onTemplateClick,
}: PermissionEditProps) {
  const [isDirty, setIsDirty] = useState(false);

  const handleTogglePermission = (permissionValue: string, checked: boolean) => {
    let newPermissions = { ...value, [permissionValue]: checked };

    // Enforce dependency: permission-edit implies permission-view
    if (permissionValue === 'permission-edit' && checked) {
      newPermissions['permission-view'] = true;
    }

    onChange(newPermissions);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Edit Permissions</h2>
      
      {templates.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <h3 className="font-medium">Suggestions</h3>
            <span className="ml-2 text-muted-foreground text-sm flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Click to apply
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(template => (
              <Badge 
                key={template.id} 
                variant="secondary"
                className="cursor-pointer px-3 py-1 hover:bg-accent"
                onClick={() => onTemplateClick(template.id)}
              >
                {template.policyName}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {PERMISSION_GROUPS.map(group => (
          <div key={group.id} className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">{group.label}</h3>
            <div className="space-y-2">
              {group.permissions.map(permission => {
                // Disable permission-view if permission-edit is enabled
                const isViewPermission = permission.value === 'permission-view';
                const isDisabled = isViewPermission && value['permission-edit'];
                
                return (
                  <div key={permission.id} className="flex items-center">
                    <Checkbox
                      checked={value[permission.value] || false}
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
        <Button onClick={onSaveClick} disabled={saving || !isDirty}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}