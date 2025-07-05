import { Checkbox } from "@/components/ui/indeterminate-checkbox";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { PermissionValue } from "../types";
import type { PermissionGroup } from "../../types";

interface PermissionGroupItemProps {
  group: PermissionGroup;
  permissionsValue: PermissionValue;
  isExpanded: boolean;
  onGroupToggle: (permissions: string[]) => void;
  onPermissionToggle: (permissionValue: string, checked: boolean) => void;
}

export function PermissionGroupItem({
  group,
  permissionsValue,
  onGroupToggle,
  onPermissionToggle,
}: PermissionGroupItemProps) {
  const groupPermissions = group.permissions.map((p) => p.value);
  const allChecked = groupPermissions.every(
    (perm) => permissionsValue[perm]
  );
  const someChecked = groupPermissions.some(
    (perm) => permissionsValue[perm]
  );

  return (
    <AccordionItem value={group.id} className="border rounded-lg bg-card">
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked && !allChecked}
            onCheckedChange={() => onGroupToggle(groupPermissions)}
            className="mr-2"
            onClick={(e) => e.stopPropagation()}
          />
          <h3 className="font-medium">{group.label}</h3>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-2">
          {group.permissions.map((permission) => {
            const isViewPermission =
              permission.value === "permission-view";
            const isDisabled =
              isViewPermission && permissionsValue["permission-edit"];

            return (
              <div
                key={permission.id}
                className="flex items-center pl-6"
              >
                <Checkbox
                  checked={
                    permissionsValue[permission.value] || false
                  }
                  onCheckedChange={(checked) =>
                    onPermissionToggle(
                      permission.value,
                      !!checked
                    )
                  }
                  className="mr-2"
                  disabled={isDisabled}
                />
                <label
                  className={
                    isDisabled ? "text-muted-foreground" : ""
                  }
                >
                  {permission.label}
                </label>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}