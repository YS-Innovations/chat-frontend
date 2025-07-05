import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/indeterminate-checkbox";
import { PermissionItem } from "./PermissionItem";
import type { Permission } from "../../../types/types";

interface PermissionGroupProps {
  id: string;
  label: string;
  permissions: Permission[];
  permissionsState: Record<string, boolean>;
  onToggleGroup: (permissions: string[]) => void;
  onTogglePermission: (value: string, checked: boolean) => void;
}

export function PermissionGroup({
  id,
  label,
  permissions,
  permissionsState,
  onToggleGroup,
  onTogglePermission,
}: PermissionGroupProps) {
  const groupPermissions = permissions.map((p) => p.value);
  const allChecked = groupPermissions.every((perm) => permissionsState[perm]);
  const someChecked = groupPermissions.some((perm) => permissionsState[perm]);

  return (
    <AccordionItem key={id} value={id} className="border rounded-lg bg-card">
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked && !allChecked}
            onCheckedChange={() => onToggleGroup(groupPermissions)}
            className="mr-2"
            onClick={(e) => e.stopPropagation()}
          />
          <h3 className="font-medium">{label}</h3>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-2">
          {permissions.map((permission) => (
            <PermissionItem
              key={permission.id}
              id={permission.id}
              label={permission.label}
              value={permission.value}
              checked={permissionsState[permission.value] || false}
              onToggle={onTogglePermission}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
