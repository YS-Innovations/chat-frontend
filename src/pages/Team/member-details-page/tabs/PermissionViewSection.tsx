import { Check } from "lucide-react";
import type { PermissionGroup } from "@/pages/permissions/types/types";

interface PermissionGroupSectionProps {
  group: PermissionGroup;
  tempPermissions: Record<string, boolean>;
}

export function PermissionGroupSection({ group, tempPermissions }: PermissionGroupSectionProps) {
  const groupPermissions = group.permissions.filter(p => tempPermissions[p.value]);
  
  if (groupPermissions.length === 0) return null;

  return (
    <div className="border rounded-lg p-4">
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
}