// src/pages/permissions/components/permission-view.tsx
import { PERMISSION_GROUPS } from "../types";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface PermissionViewProps {
  selectedPermissions: Record<string, boolean>;
  onEdit: () => void;
}

export function PermissionView({ selectedPermissions, onEdit }: PermissionViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Permissions</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        {PERMISSION_GROUPS.map(group => {
          const groupPermissions = group.permissions.filter(p => 
            selectedPermissions[p.value]
          );

          if (groupPermissions.length === 0) return null;

          return (
            <div key={group.id} className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">{group.label}</h3>
              <div className="space-y-2">
                {groupPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center p-2 rounded bg-green-50">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>{permission.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}